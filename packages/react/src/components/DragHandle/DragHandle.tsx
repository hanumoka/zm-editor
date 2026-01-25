'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

export interface DragHandleProps {
  editor: Editor;
}

// ProseMirror Node 타입 (타입 정의만 사용)
interface ProseMirrorNode {
  type: { name: string };
  nodeSize: number;
}

// 드래그 핸들 크기
const HANDLE_SIZE = 24;
// 드래그 핸들 왼쪽 여백
const HANDLE_LEFT_OFFSET = 32;
// 숨김 지연 시간 (ms)
const HIDE_DELAY = 150;
// 뷰포트 왼쪽 경계 최소 여백 (px)
const MIN_LEFT_MARGIN = 4;
// 왼쪽 여백 영역에서 마우스 X좌표 조정값 (px)
const LEFT_MARGIN_X_OFFSET = 10;

// 개별 항목으로 드래그 가능한 노드 타입
const DRAGGABLE_ITEM_TYPES = ['taskItem', 'listItem', 'tableRow'];
// 테이블 내부 노드 (테이블 자체가 아닌 내부 요소들) - 이 요소 위에서는 테이블 전체를 드래그
const TABLE_INTERNAL_TYPES = ['tableCell', 'tableHeader'];
// 드래그 핸들을 표시하지 않을 노드 타입 (완전히 드래그 불가)
const NON_DRAGGABLE_TYPES: string[] = [];
// 노드 타입별 추가 오프셋 (미세 조정)
const NODE_TYPE_OFFSETS: Record<string, number> = {
  heading: 0,
  taskItem: 0,
  listItem: 0,
};

// 디버그 모드 플래그 (프로덕션에서는 false)
const DEBUG = false;

function debugLog(category: string, ...args: unknown[]) {
  if (DEBUG) {
    console.log(`[DragHandle:${category}]`, ...args);
  }
}

// Atom 노드 타입과 해당 data 속성 매핑
const ATOM_NODE_DATA_ATTRIBUTES = [
  'data-api-block',
  'data-terminal',
  'data-diagram-block',
  'data-graphql-block',
  'data-log-block',
  'data-metadata-block',
  'data-openapi-block',
  'data-stack-trace-block',
];

/**
 * DOM 요소에서 가장 가까운 NodeViewWrapper를 찾습니다.
 * React NodeView (atom 노드 포함)를 감지하는 데 사용됩니다.
 */
function findClosestNodeViewWrapper(element: HTMLElement | null, editorDom: HTMLElement): HTMLElement | null {
  let current = element;
  while (current && current !== document.body && current !== editorDom) {
    // Tiptap의 NodeViewWrapper는 data-node-view-wrapper 속성을 가짐
    if (current.hasAttribute('data-node-view-wrapper')) {
      debugLog('findWrapper', 'Found via data-node-view-wrapper');
      return current;
    }
    // Atom 노드의 data 속성 확인 (data-api-block, data-terminal 등)
    for (const attr of ATOM_NODE_DATA_ATTRIBUTES) {
      if (current.hasAttribute(attr)) {
        debugLog('findWrapper', 'Found via atom data attribute:', attr);
        return current;
      }
    }
    // zm- 접두사가 붙은 node wrapper 클래스 확인
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(' ');
      for (const cls of classes) {
        if (cls.includes('-node-wrapper') || cls.includes('-node ') || cls.startsWith('zm-') && cls.includes('-block')) {
          debugLog('findWrapper', 'Found via class:', cls);
          return current;
        }
      }
    }
    // data-type 속성 확인 (일부 노드 뷰에서 사용)
    if (current.hasAttribute('data-type')) {
      debugLog('findWrapper', 'Found via data-type:', current.getAttribute('data-type'));
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * DOM 요소에서 최상위 블록 요소를 찾습니다.
 * ProseMirror 에디터의 직접 자식 요소를 찾습니다.
 */
function findTopLevelBlockElement(element: HTMLElement | null, editorDom: HTMLElement): HTMLElement | null {
  let current = element;
  let lastValidBlock: HTMLElement | null = null;

  while (current && current !== document.body) {
    if (current.parentElement === editorDom) {
      // editorDom의 직접 자식 = 최상위 블록
      debugLog('findTopLevelBlock', 'Found direct child of editor:', current.tagName, current.className);
      return current;
    }
    // editorDom 안에 있는 요소라면 기록
    if (editorDom.contains(current)) {
      lastValidBlock = current;
    }
    current = current.parentElement;
  }
  return lastValidBlock;
}

/**
 * DOM 요소에서 ProseMirror 노드 위치를 찾습니다.
 * posAtCoords가 실패할 때 폴백으로 사용됩니다.
 */
function findNodePosFromDOM(
  editor: Editor,
  element: HTMLElement
): { pos: number; node: ProseMirrorNode } | null {
  const editorDom = editor.view.dom;

  try {
    debugLog('findNodePosFromDOM', 'Searching from element:', element.tagName, element.className);

    // 1. NodeViewWrapper 찾기
    const wrapper = findClosestNodeViewWrapper(element, editorDom);
    if (wrapper) {
      debugLog('findNodePosFromDOM', 'Found wrapper:', wrapper.className, wrapper.tagName);

      // 에디터의 직접 자식까지 올라가서 찾기 (ProseMirror가 추적하는 요소)
      let nodeElement: HTMLElement | null = wrapper;
      while (nodeElement && nodeElement.parentElement !== editorDom) {
        nodeElement = nodeElement.parentElement;
      }

      if (nodeElement) {
        debugLog('findNodePosFromDOM', 'Found direct child of editor:', nodeElement.tagName, nodeElement.className);
        try {
          const pos = editor.view.posAtDOM(nodeElement, 0);
          debugLog('findNodePosFromDOM', 'posAtDOM for direct child returned:', pos);

          if (pos >= 0) {
            // 해당 위치에서 노드 찾기
            const nodeAtPos = editor.state.doc.nodeAt(pos);
            if (nodeAtPos) {
              debugLog('findNodePosFromDOM', 'Found node at pos:', {
                type: nodeAtPos.type.name,
                pos: pos
              });
              return { pos, node: nodeAtPos as ProseMirrorNode };
            }

            // depth 1에서 노드 찾기 (경계 문제 해결)
            const $pos = editor.state.doc.resolve(pos);
            if ($pos.depth >= 1) {
              const nodePos = $pos.before(1);
              const node = editor.state.doc.nodeAt(nodePos);
              if (node) {
                debugLog('findNodePosFromDOM', 'Found node via $pos.before(1):', {
                  type: node.type.name,
                  pos: nodePos
                });
                return { pos: nodePos, node: node as ProseMirrorNode };
              }
            }
          }
        } catch (e) {
          debugLog('findNodePosFromDOM', 'Error getting pos from direct child:', e);
        }
      }

      // 원래 wrapper에서 다시 시도
      try {
        const pos = editor.view.posAtDOM(wrapper, 0);
        debugLog('findNodePosFromDOM', 'posAtDOM for wrapper returned:', pos);

        if (pos >= 0) {
          const $pos = editor.state.doc.resolve(pos);
          debugLog('findNodePosFromDOM', 'Resolved pos depth:', $pos.depth);

          // depth >= 1에서 노드 찾기
          if ($pos.depth >= 1) {
            const nodePos = $pos.before(1);
            const node = editor.state.doc.nodeAt(nodePos);
            if (node) {
              debugLog('findNodePosFromDOM', 'Found node via wrapper $pos.before(1):', {
                type: node.type.name,
                pos: nodePos
              });
              return { pos: nodePos, node: node as ProseMirrorNode };
            }
          }

          // pos에서 직접 찾기
          const nodeAtPos = editor.state.doc.nodeAt(pos);
          if (nodeAtPos) {
            debugLog('findNodePosFromDOM', 'Found node at exact pos:', {
              type: nodeAtPos.type.name,
              pos: pos
            });
            return { pos, node: nodeAtPos as ProseMirrorNode };
          }

          // pos-1에서도 시도 (경계 문제 해결)
          if (pos > 0) {
            const nodeAtPosMinus1 = editor.state.doc.nodeAt(pos - 1);
            if (nodeAtPosMinus1) {
              debugLog('findNodePosFromDOM', 'Found node at pos-1:', {
                type: nodeAtPosMinus1.type.name,
                pos: pos - 1
              });
              return { pos: pos - 1, node: nodeAtPosMinus1 as ProseMirrorNode };
            }
          }
        }
      } catch (e) {
        debugLog('findNodePosFromDOM', 'posAtDOM error for wrapper:', e);
      }
    }

    // 2. 최상위 블록 요소 찾기 (폴백)
    const topBlock = findTopLevelBlockElement(element, editorDom);
    if (topBlock) {
      debugLog('findNodePosFromDOM', 'Trying top block element:', topBlock.tagName, topBlock.className);
      try {
        const pos = editor.view.posAtDOM(topBlock, 0);
        debugLog('findNodePosFromDOM', 'Top block posAtDOM:', pos);

        if (pos >= 0) {
          // 해당 위치에서 노드 찾기
          const nodeAtPos = editor.state.doc.nodeAt(pos);
          if (nodeAtPos) {
            debugLog('findNodePosFromDOM', 'Found node via top block:', {
              type: nodeAtPos.type.name,
              pos: pos
            });
            return { pos, node: nodeAtPos as ProseMirrorNode };
          }

          // resolve 후 depth 1에서 찾기
          const $pos = editor.state.doc.resolve(pos);
          if ($pos.depth >= 1) {
            const nodePos = $pos.before(1);
            const node = editor.state.doc.nodeAt(nodePos);
            if (node) {
              debugLog('findNodePosFromDOM', 'Found node via resolve:', {
                type: node.type.name,
                pos: nodePos
              });
              return { pos: nodePos, node: node as ProseMirrorNode };
            }
          }
        }
      } catch (e) {
        debugLog('findNodePosFromDOM', 'Top block error:', e);
      }
    }

    debugLog('findNodePosFromDOM', 'No node found');
    return null;
  } catch (e) {
    debugLog('findNodePosFromDOM', 'Error:', e);
    return null;
  }
}

/**
 * 문서 구조를 디버그 로그로 출력합니다.
 */
function debugDocumentStructure(editor: Editor, label: string) {
  if (!DEBUG) return;

  console.group(`[DragHandle:docStructure] ${label}`);
  const doc = editor.state.doc;
  let index = 0;

  doc.forEach((node, offset) => {
    const info = {
      index,
      type: node.type.name,
      pos: offset,
      size: node.nodeSize,
      textContent: node.textContent?.substring(0, 30) || '(empty)',
    };
    console.log(`  [${index}] pos=${offset}, type=${node.type.name}, size=${node.nodeSize}, text="${info.textContent}"`);

    // 자식 노드 (taskList 등의 경우)
    if (node.childCount > 0) {
      let childIndex = 0;
      node.forEach((child, childOffset) => {
        console.log(`    [${index}.${childIndex}] pos=${offset + 1 + childOffset}, type=${child.type.name}, size=${child.nodeSize}, text="${child.textContent?.substring(0, 30)}"`);
        childIndex++;
      });
    }
    index++;
  });
  console.groupEnd();
}

/**
 * 드래그 가능한 노드와 위치를 찾습니다.
 */
function findDraggableNode(
  editor: Editor,
  pos: number
): { node: ProseMirrorNode; pos: number; depth: number } | null {
  try {
    debugLog('findDraggableNode', 'Input pos:', pos);
    const resolvedPos = editor.state.doc.resolve(pos);
    debugLog('findDraggableNode', 'Resolved depth:', resolvedPos.depth, 'parentOffset:', resolvedPos.parentOffset);

    // 해당 위치에서 시작하는 노드가 있는지 확인 (노드 경계에 있는 경우)
    // parentOffset이 0이면 현재 부모의 시작점에 있음
    if (resolvedPos.parentOffset === 0 && resolvedPos.depth > 0) {
      // 현재 위치의 부모 노드의 첫 번째 자식을 확인
      const parent = resolvedPos.parent;
      if (parent.childCount > 0) {
        const firstChild = parent.child(0);
        const firstChildTypeName = firstChild.type.name;
        debugLog('findDraggableNode', 'At node boundary, checking first child:', firstChildTypeName);

        if (DRAGGABLE_ITEM_TYPES.includes(firstChildTypeName)) {
          const result = {
            node: firstChild as ProseMirrorNode,
            pos: pos,
            depth: resolvedPos.depth + 1,
          };
          debugLog('findDraggableNode', 'Found draggable item at boundary:', {
            type: firstChildTypeName,
            pos: result.pos,
            depth: result.depth,
            nodeSize: firstChild.nodeSize
          });
          return result;
        }
      }
    }

    // 해당 위치에 노드가 시작하는지 확인 (nodeAt으로 직접 확인)
    const nodeAtPos = editor.state.doc.nodeAt(pos);
    if (nodeAtPos) {
      const nodeTypeName = nodeAtPos.type.name;
      debugLog('findDraggableNode', 'Node at exact pos:', nodeTypeName, 'nodeSize:', nodeAtPos.nodeSize);

      if (DRAGGABLE_ITEM_TYPES.includes(nodeTypeName)) {
        // 해당 위치의 depth 계산 (범위 초과 시 안전하게 처리)
        let depth = 1;
        try {
          const nodeResolvedPos = editor.state.doc.resolve(pos + 1);
          depth = nodeResolvedPos.depth;
        } catch {
          debugLog('findDraggableNode', 'Could not resolve pos+1, using depth=1');
        }
        const result = {
          node: nodeAtPos as ProseMirrorNode,
          pos: pos,
          depth: depth,
        };
        debugLog('findDraggableNode', 'Found draggable item at exact pos:', {
          type: nodeTypeName,
          pos: result.pos,
          depth: result.depth,
          nodeSize: nodeAtPos.nodeSize
        });
        return result;
      }
    }

    // depth를 순회하며 드래그 가능한 노드 찾기
    for (let d = resolvedPos.depth; d >= 1; d--) {
      const node = resolvedPos.node(d);
      const nodeTypeName = node.type.name;
      debugLog('findDraggableNode', `Depth ${d}: nodeType=${nodeTypeName}, nodeSize=${node.nodeSize}`);

      // 드래그 불가 노드 내부면 null 반환
      if (NON_DRAGGABLE_TYPES.includes(nodeTypeName)) {
        debugLog('findDraggableNode', 'Non-draggable type found, returning null');
        return null;
      }

      // 테이블 내부 요소(cell, header, row)는 건너뛰고 table 자체를 찾기 위해 계속
      if (TABLE_INTERNAL_TYPES.includes(nodeTypeName)) {
        debugLog('findDraggableNode', 'Table internal type, continuing to find table');
        continue;
      }

      // table 타입이면 테이블 전체를 드래그 가능하게 반환
      if (nodeTypeName === 'table') {
        const result = {
          node,
          pos: resolvedPos.before(d),
          depth: d,
        };
        debugLog('findDraggableNode', 'Found table node:', {
          type: nodeTypeName,
          pos: result.pos,
          depth: result.depth,
          nodeSize: node.nodeSize
        });
        return result;
      }

      // 개별 항목 타입이면 해당 항목 반환
      if (DRAGGABLE_ITEM_TYPES.includes(nodeTypeName)) {
        const result = {
          node,
          pos: resolvedPos.before(d),
          depth: d,
        };
        debugLog('findDraggableNode', 'Found draggable item:', {
          type: nodeTypeName,
          pos: result.pos,
          depth: result.depth,
          nodeSize: node.nodeSize
        });
        return result;
      }
    }

    // 최상위 블록 (depth 1) 반환
    if (resolvedPos.depth >= 1) {
      const node = resolvedPos.node(1);
      const topNodeTypeName = node.type.name;
      if (NON_DRAGGABLE_TYPES.includes(topNodeTypeName)) {
        debugLog('findDraggableNode', 'Top-level node is non-draggable');
        return null;
      }
      // 테이블 내부 타입이 최상위에 있는 경우는 없지만 안전하게 체크
      if (TABLE_INTERNAL_TYPES.includes(topNodeTypeName)) {
        debugLog('findDraggableNode', 'Top-level is table internal type (unexpected)');
        return null;
      }
      const result = {
        node,
        pos: resolvedPos.before(1),
        depth: 1,
      };
      debugLog('findDraggableNode', 'Found top-level block:', {
        type: topNodeTypeName,
        pos: result.pos,
        depth: result.depth,
        nodeSize: node.nodeSize
      });
      return result;
    }

    debugLog('findDraggableNode', 'No draggable node found');
    return null;
  } catch (e) {
    debugLog('findDraggableNode', 'Error:', e);
    return null;
  }
}

/**
 * TaskItem에서 텍스트 콘텐츠 영역(div)을 찾습니다.
 */
function findTaskItemContentElement(taskItemElement: HTMLElement): HTMLElement | null {
  // TaskItem 구조: <li><label><input/></label><div>텍스트</div></li>
  // 또는: <li><label><input/></label><p>텍스트</p></li>
  for (const child of taskItemElement.children) {
    if (child instanceof HTMLElement) {
      // label, input은 건너뛰기
      if (child.tagName === 'LABEL' || child.tagName === 'INPUT') {
        continue;
      }
      // div, p, span 등 텍스트 콘텐츠 영역
      if (['DIV', 'P', 'SPAN'].includes(child.tagName)) {
        return child;
      }
    }
  }
  return null;
}

/**
 * 노드 타입에 따라 콘텐츠 영역의 상단 위치를 계산합니다.
 */
function getContentTop(element: HTMLElement, nodeTypeName: string): number {
  const rect = element.getBoundingClientRect();
  debugLog('getContentTop', `nodeType=${nodeTypeName}, element.rect.top=${rect.top}`);

  // TaskItem 특별 처리: 텍스트 영역의 실제 위치를 사용
  if (nodeTypeName === 'taskItem') {
    const contentElement = findTaskItemContentElement(element);
    if (contentElement) {
      // 콘텐츠 요소 내의 첫 번째 텍스트 요소 찾기
      const firstTextElement = findFirstTextElement(contentElement);
      if (firstTextElement && firstTextElement !== contentElement) {
        const textRect = firstTextElement.getBoundingClientRect();
        debugLog('getContentTop', `TaskItem: found text element, textRect.top=${textRect.top}`);
        return textRect.top;
      }
      // 텍스트 요소를 못 찾으면 패딩 고려
      const contentStyle = window.getComputedStyle(contentElement);
      const paddingTop = parseFloat(contentStyle.paddingTop) || 0;
      const contentRect = contentElement.getBoundingClientRect();
      const adjustedTop = contentRect.top + paddingTop;
      debugLog('getContentTop', `TaskItem: using content with padding, top=${adjustedTop}, paddingTop=${paddingTop}`);
      return adjustedTop;
    }
    debugLog('getContentTop', 'TaskItem: no content element found, using element rect');
  }

  // ListItem 처리: 첫 번째 텍스트 요소 찾기
  if (nodeTypeName === 'listItem') {
    const firstText = findFirstTextElement(element);
    if (firstText && firstText !== element) {
      const textTop = firstText.getBoundingClientRect().top;
      debugLog('getContentTop', `ListItem: firstText.top=${textTop}`);
      return textTop;
    }
    debugLog('getContentTop', 'ListItem: no firstText found');
  }

  // Heading 처리: 직접 요소의 top 사용 (margin은 bounding rect에 포함되지 않음)
  if (nodeTypeName === 'heading') {
    debugLog('getContentTop', `Heading: using rect.top=${rect.top}`);
    return rect.top;
  }

  // Atom 노드 (React NodeView) 처리: 요소의 rect.top 직접 사용
  // React 컴포넌트 내부의 텍스트 요소는 정확한 위치를 제공하지 않을 수 있음
  const atomNodeTypes = [
    'apiBlock', 'terminal', 'diagram', 'graphql', 'logBlock',
    'metadata', 'openapi', 'stackTrace', 'horizontalRule'
  ];
  if (atomNodeTypes.includes(nodeTypeName)) {
    debugLog('getContentTop', `Atom node (${nodeTypeName}): using rect.top=${rect.top}`);
    return rect.top;
  }

  // 기본: 첫 번째 텍스트 요소 찾기
  const firstTextElement = findFirstTextElement(element);
  if (firstTextElement && firstTextElement !== element) {
    const textTop = firstTextElement.getBoundingClientRect().top;
    debugLog('getContentTop', `Default: firstTextElement.top=${textTop}`);
    return textTop;
  }

  // 텍스트 요소를 찾지 못하면 padding + border 이후 위치 반환
  const style = window.getComputedStyle(element);
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const result = rect.top + paddingTop + borderTop;
  debugLog('getContentTop', `Fallback: rect.top + padding + border = ${result}`);
  return result;
}

/**
 * 요소 내에서 첫 번째 텍스트를 포함한 요소를 찾습니다.
 */
function findFirstTextElement(element: HTMLElement): HTMLElement | null {
  // 체크박스, 라벨, SVG 등은 건너뛰기
  const skipTags = ['INPUT', 'LABEL', 'SVG', 'BUTTON'];
  if (skipTags.includes(element.tagName)) {
    return null;
  }

  // 직접 텍스트 노드가 있는지 확인
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      return element;
    }
  }

  // 자식 요소들 순회
  for (const child of element.children) {
    if (child instanceof HTMLElement) {
      // 건너뛸 태그 확인
      if (skipTags.includes(child.tagName)) {
        continue;
      }
      const found = findFirstTextElement(child);
      if (found) {
        return found;
      }
    }
  }

  return element;
}

/**
 * 노드 타입에 따라 적절한 라인 높이를 계산합니다.
 */
function getNodeLineHeight(element: HTMLElement, nodeTypeName: string): number {
  debugLog('getNodeLineHeight', `nodeType=${nodeTypeName}`);

  // TaskItem의 경우 콘텐츠 영역의 라인 높이 사용
  if (nodeTypeName === 'taskItem') {
    const contentElement = findTaskItemContentElement(element);
    if (contentElement) {
      const lh = getLineHeight(contentElement);
      debugLog('getNodeLineHeight', `TaskItem content lineHeight=${lh}`);
      return lh;
    }
  }

  // Atom 노드 (React NodeView): 고정 라인 높이 사용
  // React 컴포넌트 내부에서 텍스트 요소를 찾는 것이 정확하지 않음
  const atomNodeTypes = [
    'apiBlock', 'terminal', 'diagram', 'graphql', 'logBlock',
    'metadata', 'openapi', 'stackTrace', 'horizontalRule'
  ];
  if (atomNodeTypes.includes(nodeTypeName)) {
    const atomLineHeight = 24; // 고정 라인 높이
    debugLog('getNodeLineHeight', `Atom node (${nodeTypeName}): using fixed lineHeight=${atomLineHeight}`);
    return atomLineHeight;
  }

  // 기본: 첫 번째 텍스트 요소의 라인 높이
  const textElement = findFirstTextElement(element) || element;
  const lh = getLineHeight(textElement);
  debugLog('getNodeLineHeight', `Default lineHeight=${lh}`);
  return lh;
}

/**
 * 텍스트 라인 높이를 계산합니다.
 */
function getLineHeight(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const lineHeight = style.lineHeight;
  const fontSize = parseFloat(style.fontSize) || 16;

  debugLog('getLineHeight', `element: ${element.tagName}, style.lineHeight="${lineHeight}", fontSize=${fontSize}`);

  if (lineHeight === 'normal') {
    // normal인 경우 font-size에 비례한 값 사용
    const result = fontSize * 1.3;
    debugLog('getLineHeight', `lineHeight=normal, using fontSize*1.3 = ${result}`);
    return result;
  }

  const parsed = parseFloat(lineHeight);
  const result = isNaN(parsed) ? 24 : parsed;
  debugLog('getLineHeight', `parsed lineHeight = ${result}`);
  return result;
}

/**
 * DragHandle - 블록 드래그 핸들 컴포넌트
 */
export function DragHandle({ editor }: DragHandleProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<{ pos: number; nodeSize: number; depth: number } | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMouseOverHandleRef = useRef(false);
  const isDraggingRef = useRef(false);

  const cancelHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      debugLog('visibility', 'cancelHideTimeout: Clearing pending hide timeout');
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hideWithDelay = useCallback(() => {
    debugLog('visibility', `hideWithDelay: Scheduling hide in ${HIDE_DELAY}ms`);
    cancelHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      debugLog('visibility', 'hideWithDelay: Timeout fired', {
        isMouseOverHandle: isMouseOverHandleRef.current,
        isDragging: isDraggingRef.current
      });
      if (!isMouseOverHandleRef.current && !isDraggingRef.current) {
        debugLog('visibility', 'hideWithDelay: >>> HIDING HANDLE <<<');
        setVisible(false);
      } else {
        debugLog('visibility', 'hideWithDelay: Skipped hiding (mouse over handle or dragging)');
      }
    }, HIDE_DELAY);
  }, [cancelHideTimeout]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging) {
        // 드래그 중에는 로그 생략
        return;
      }

      const editorElement = editor.view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      if (handleRef.current?.contains(event.target as Node)) {
        // 핸들 위에 있으면 로그 생략 (너무 많이 출력됨)
        cancelHideTimeout();
        return;
      }

      const isInEditorArea =
        event.clientX >= editorRect.left - HANDLE_LEFT_OFFSET &&
        event.clientX <= editorRect.right &&
        event.clientY >= editorRect.top &&
        event.clientY <= editorRect.bottom;

      if (!isInEditorArea) {
        debugLog('mouseMove', 'Mouse left editor area, hiding', {
          mouseX: event.clientX,
          mouseY: event.clientY,
          editorLeft: editorRect.left,
          editorRight: editorRect.right,
          editorTop: editorRect.top,
          editorBottom: editorRect.bottom
        });
        hideWithDelay();
        return;
      }

      // 마우스가 핸들 영역(왼쪽 여백)에 있으면 X 좌표를 에디터 내부로 조정
      // 이렇게 해야 올바른 블록을 감지할 수 있음
      let coordsX = event.clientX;
      const isInLeftMargin = event.clientX < editorRect.left;

      if (isInLeftMargin) {
        // 에디터 왼쪽 가장자리 + 약간의 여백으로 조정
        coordsX = editorRect.left + LEFT_MARGIN_X_OFFSET;
        debugLog('mouseMove', 'Mouse in left margin, adjusting X:', {
          originalX: event.clientX,
          adjustedX: coordsX,
          mouseY: event.clientY
        });
      }

      let draggableInfo: { node: ProseMirrorNode; pos: number; depth: number } | null = null;
      let dom: HTMLElement | null = null;

      // 마우스가 왼쪽 여백에 있을 때, 조정된 좌표에서 실제 대상 요소 찾기
      let targetElement: HTMLElement | null = event.target instanceof HTMLElement ? event.target : null;
      if (isInLeftMargin) {
        const elementAtAdjustedCoords = document.elementFromPoint(coordsX, event.clientY);
        if (elementAtAdjustedCoords instanceof HTMLElement && editorElement.contains(elementAtAdjustedCoords)) {
          targetElement = elementAtAdjustedCoords;
          debugLog('mouseMove', 'Using element from adjusted coords:', targetElement.tagName, targetElement.className);
        }
      }

      // 1차 시도: React NodeView 확인 (atom 노드용)
      // React NodeView 내부의 posAtCoords는 정확하지 않으므로 먼저 NodeViewWrapper를 확인
      if (targetElement) {
        const wrapper = findClosestNodeViewWrapper(targetElement, editorElement);
        if (wrapper) {
          debugLog('mouseMove', 'Found React NodeView wrapper, trying DOM-based detection');
          const nodeFromDOM = findNodePosFromDOM(editor, targetElement);
          if (nodeFromDOM) {
            draggableInfo = {
              node: nodeFromDOM.node,
              pos: nodeFromDOM.pos,
              depth: 1,
            };
            debugLog('mouseMove', 'Found node via DOM (React NodeView):', {
              type: nodeFromDOM.node.type.name,
              pos: nodeFromDOM.pos
            });
          }
        }
      }

      // 2차 시도: posAtCoords를 사용하여 위치 찾기 (일반 블록용)
      if (!draggableInfo) {
        const posAtCoords = editor.view.posAtCoords({
          left: coordsX,
          top: event.clientY,
        });

        if (posAtCoords) {
          draggableInfo = findDraggableNode(editor, posAtCoords.pos);
        }
      }

      if (!draggableInfo) {
        debugLog('mouseMove', 'No draggable node found, hiding');
        hideWithDelay();
        return;
      }

      dom = editor.view.nodeDOM(draggableInfo.pos) as HTMLElement | null;

      // DOM을 찾지 못한 경우, NodeViewWrapper에서 찾기
      if (!dom || !(dom instanceof HTMLElement)) {
        if (targetElement) {
          const wrapper = findClosestNodeViewWrapper(targetElement, editorElement);
          if (wrapper) {
            dom = wrapper;
            debugLog('mouseMove', 'Using NodeViewWrapper as DOM element');
          }
        }
      }

      if (!dom || !(dom instanceof HTMLElement)) {
        debugLog('mouseMove', 'No DOM element for node, hiding');
        hideWithDelay();
        return;
      }

      const nodeTypeName = draggableInfo.node.type.name;

      // 이전 노드와 다른 노드인지 확인
      const prevNodePos = currentNodeRef.current?.pos;
      const isNewNode = prevNodePos !== draggableInfo.pos;

      if (isNewNode) {
        debugLog('mouseMove', '--- Node changed ---');
        debugLog('mouseMove', 'New node:', {
          type: nodeTypeName,
          pos: draggableInfo.pos,
          nodeSize: draggableInfo.node.nodeSize,
          depth: draggableInfo.depth
        });
      }

      currentNodeRef.current = {
        pos: draggableInfo.pos,
        nodeSize: draggableInfo.node.nodeSize,
        depth: draggableInfo.depth,
      };

      cancelHideTimeout();

      // 노드 타입에 따른 콘텐츠 상단 위치 계산
      const contentTop = getContentTop(dom, nodeTypeName);

      // 노드 타입에 따른 라인 높이 계산
      const lineHeight = getNodeLineHeight(dom, nodeTypeName);

      // 핸들을 텍스트 라인 중앙에 배치
      const verticalOffset = Math.max(0, (lineHeight - HANDLE_SIZE) / 2);

      // 노드 타입별 미세 조정 오프셋
      const nodeOffset = NODE_TYPE_OFFSETS[nodeTypeName] || 0;

      const newTop = contentTop + verticalOffset + nodeOffset;
      // 핸들이 뷰포트 왼쪽 밖으로 나가지 않도록 최소값 보장
      const calculatedLeft = editorRect.left - HANDLE_LEFT_OFFSET;
      const newLeft = Math.max(MIN_LEFT_MARGIN, calculatedLeft);

      if (isNewNode) {
        debugLog('position', '=== Position Calculation for NEW node ===');
        debugLog('position', 'DOM element:', {
          tagName: dom.tagName,
          className: dom.className,
          id: dom.id || '(no id)'
        });
        const domRect = dom.getBoundingClientRect();
        debugLog('position', 'DOM getBoundingClientRect:', {
          top: domRect.top,
          left: domRect.left,
          width: domRect.width,
          height: domRect.height
        });
        debugLog('position', 'Window scroll:', {
          scrollX: window.scrollX,
          scrollY: window.scrollY
        });
        debugLog('position', 'Calculated values:', {
          contentTop,
          lineHeight,
          verticalOffset,
          nodeOffset,
          HANDLE_SIZE,
          HANDLE_LEFT_OFFSET,
          editorRectLeft: editorRect.left,
          calculatedLeft
        });
        debugLog('position', '>>> FINAL handle position:', {
          top: newTop,
          left: newLeft,
          wasClampedLeft: calculatedLeft !== newLeft
        });
      }

      // 새 노드로 이동 시 핸들을 숨기고 새 위치에 즉시 표시
      if (isNewNode && visible) {
        debugLog('visibility', '>>> Node changed while visible - HIDE then SHOW at new position');
        debugLog('visibility', 'Step 1: setVisible(false)');
        setVisible(false);
        // 다음 프레임에서 새 위치에 표시
        requestAnimationFrame(() => {
          debugLog('visibility', 'Step 2 (RAF): setPosition and setVisible(true)');
          debugLog('position', '>>> Setting position (RAF):', { top: newTop, left: newLeft });
          setPosition({ top: newTop, left: newLeft });
          setVisible(true);
        });
      } else if (isNewNode && !visible) {
        debugLog('visibility', '>>> New node, handle was hidden - SHOW at new position');
        debugLog('position', '>>> Setting position:', { top: newTop, left: newLeft });
        setPosition({ top: newTop, left: newLeft });
        setVisible(true);
      } else {
        // 같은 노드 - 위치만 업데이트 (로그 생략, 너무 많음)
        setPosition({ top: newTop, left: newLeft });
        setVisible(true);
      }
    },
    [editor, isDragging, cancelHideTimeout, hideWithDelay, visible]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      debugLog('dragStart', '========== DRAG START ==========');

      if (!currentNodeRef.current) {
        debugLog('dragStart', 'ERROR: No currentNodeRef');
        return;
      }

      setIsDragging(true);
      isDraggingRef.current = true;
      event.dataTransfer.effectAllowed = 'move';

      const { pos, nodeSize, depth } = currentNodeRef.current;
      debugLog('dragStart', 'Source node:', { pos, nodeSize, depth });

      // 현재 노드 정보 및 JSON 저장
      const sourceNode = editor.state.doc.nodeAt(pos);
      let nodeJSON = null;
      let nodeTypeName = '';
      if (sourceNode) {
        nodeTypeName = sourceNode.type.name;
        nodeJSON = sourceNode.toJSON();
        debugLog('dragStart', 'Source node type:', nodeTypeName);
        debugLog('dragStart', 'Source node content:', sourceNode.textContent?.substring(0, 50) || '(empty)');
        debugLog('dragStart', 'Source node JSON saved');
      } else {
        debugLog('dragStart', 'WARNING: Could not find node at pos', pos);
      }

      const dom = editor.view.nodeDOM(pos);
      if (dom instanceof HTMLElement) {
        debugLog('dragStart', 'DOM element:', dom.tagName, dom.className);
        const dragImage = dom.cloneNode(true) as HTMLElement;
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        dragImage.style.left = '-9999px';
        dragImage.style.opacity = '0.8';
        dragImage.style.maxWidth = '400px';
        dragImage.style.background = 'white';
        dragImage.style.padding = '4px 8px';
        dragImage.style.borderRadius = '4px';
        dragImage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 0, 0);
        setTimeout(() => {
          if (document.body.contains(dragImage)) {
            document.body.removeChild(dragImage);
          }
        }, 0);
      } else {
        debugLog('dragStart', 'WARNING: No DOM element found or not HTMLElement');
      }

      // 노드 JSON을 포함하여 드래그 데이터 저장
      const dragData = JSON.stringify({ pos, nodeSize, depth, nodeJSON, nodeTypeName });
      debugLog('dragStart', 'Setting drag data with nodeJSON');
      event.dataTransfer.setData(
        'application/x-zm-editor-block',
        dragData
      );
    },
    [editor]
  );

  const handleDragEnd = useCallback(() => {
    debugLog('dragEnd', '========== DRAG END ==========');
    debugLog('visibility', '>>> Drag ended - setIsDragging(false), setVisible(false)');
    setIsDragging(false);
    isDraggingRef.current = false;
    setVisible(false);
  }, []);

  const handleMouseEnterHandle = useCallback(() => {
    debugLog('visibility', '>>> Mouse ENTERED handle - keeping visible');
    isMouseOverHandleRef.current = true;
    cancelHideTimeout();
  }, [cancelHideTimeout]);

  const handleMouseLeaveHandle = useCallback(() => {
    debugLog('visibility', '>>> Mouse LEFT handle - scheduling hide');
    isMouseOverHandleRef.current = false;
    hideWithDelay();
  }, [hideWithDelay]);

  useEffect(() => {
    const editorElement = editor.view.dom;

    document.addEventListener('mousemove', handleMouseMove);

    const handleDrop = (event: DragEvent) => {
      debugLog('drop', '========== DROP EVENT ==========');
      debugLog('drop', 'Drop coordinates:', { clientX: event.clientX, clientY: event.clientY });

      const data = event.dataTransfer?.getData('application/x-zm-editor-block');
      if (!data) {
        debugLog('drop', 'No drag data found, ignoring drop');
        return;
      }

      debugLog('drop', 'Received drag data:', data);
      event.preventDefault();

      try {
        const { pos: sourcePos, nodeSize: originalNodeSize, depth: originalDepth, nodeJSON, nodeTypeName } = JSON.parse(data);
        debugLog('drop', 'Parsed source info:', { sourcePos, originalNodeSize, originalDepth, nodeTypeName });

        // nodeJSON이 없으면 에러
        if (!nodeJSON) {
          debugLog('drop', 'ERROR: No nodeJSON in drag data');
          return;
        }

        // 문서 구조 출력 (드롭 전)
        debugDocumentStructure(editor, 'BEFORE DROP');

        const dropPosInfo = editor.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (!dropPosInfo) {
          debugLog('drop', 'ERROR: Could not get position from coordinates');
          return;
        }

        debugLog('drop', 'Drop position info:', dropPosInfo);

        // 드롭 대상 노드 찾기
        debugLog('drop', '--- Finding target node ---');
        let targetInfo = findDraggableNode(editor, dropPosInfo.pos);

        // 타겟 노드를 찾지 못한 경우 (빈 paragraph, 블록 사이 등)
        // 드롭 위치의 최상위 블록을 찾아서 사용
        if (!targetInfo) {
          debugLog('drop', 'No draggable node at drop position, trying to find nearest block');

          // 드롭 위치에서 노드 직접 확인
          const nodeAtDrop = editor.state.doc.nodeAt(dropPosInfo.pos);
          if (nodeAtDrop) {
            debugLog('drop', 'Found node at drop position:', nodeAtDrop.type.name, 'size:', nodeAtDrop.nodeSize);
            targetInfo = {
              node: nodeAtDrop as ProseMirrorNode,
              pos: dropPosInfo.pos,
              depth: 1,
            };
          } else {
            // 노드가 없으면 resolve해서 가장 가까운 블록 찾기
            try {
              const resolved = editor.state.doc.resolve(dropPosInfo.pos);
              if (resolved.depth >= 1) {
                const parentNode = resolved.node(1);
                const parentPos = resolved.before(1);
                debugLog('drop', 'Using parent node:', parentNode.type.name, 'at pos:', parentPos);
                targetInfo = {
                  node: parentNode as ProseMirrorNode,
                  pos: parentPos,
                  depth: 1,
                };
              } else {
                // depth가 0이면 해당 위치 바로 뒤의 노드 사용
                const afterPos = dropPosInfo.pos;
                const afterNode = editor.state.doc.nodeAt(afterPos);
                if (afterNode) {
                  debugLog('drop', 'Using node after drop position:', afterNode.type.name);
                  targetInfo = {
                    node: afterNode as ProseMirrorNode,
                    pos: afterPos,
                    depth: 1,
                  };
                }
              }
            } catch (e) {
              debugLog('drop', 'Error resolving drop position:', e);
            }
          }

          if (!targetInfo) {
            debugLog('drop', 'ERROR: Could not find any target node');
            return;
          }
        }
        debugLog('drop', 'Target node found:', {
          type: targetInfo.node.type.name,
          pos: targetInfo.pos,
          depth: targetInfo.depth,
          nodeSize: targetInfo.node.nodeSize
        });

        // 저장된 nodeJSON에서 노드 재생성
        debugLog('drop', '--- Reconstructing source node from JSON ---');
        if (!editor.schema.nodes[nodeTypeName]) {
          debugLog('drop', 'ERROR: Unknown node type:', nodeTypeName);
          return;
        }

        let sourceNode;
        try {
          // Schema.nodeFromJSON을 사용하여 노드 재생성
          sourceNode = editor.schema.nodeFromJSON(nodeJSON);
          debugLog('drop', 'Source node reconstructed:', {
            type: sourceNode.type.name,
            nodeSize: sourceNode.nodeSize,
            textContent: sourceNode.textContent?.substring(0, 50) || '(empty)'
          });
        } catch (e) {
          debugLog('drop', 'ERROR: Failed to reconstruct node from JSON:', e);
          return;
        }

        // 소스 노드 정보 (저장된 데이터 + 재생성된 노드)
        const sourceInfo = {
          node: sourceNode as ProseMirrorNode,
          pos: sourcePos,
          depth: originalDepth,
        };
        debugLog('drop', 'Source info:', {
          type: sourceInfo.node.type.name,
          pos: sourceInfo.pos,
          depth: sourceInfo.depth,
          nodeSize: sourceInfo.node.nodeSize
        });

        // 같은 위치면 무시
        if (targetInfo.pos === sourceInfo.pos) {
          debugLog('drop', 'Source and target are same position, ignoring');
          return;
        }

        // 같은 부모 내에서 이동하는지 확인
        // 문서가 드래그 중 변경되었을 수 있으므로 예외 처리
        let sourceResolved, targetResolved;
        let sourceParentPos = 0, targetParentPos = 0;

        try {
          // 소스 위치가 현재 문서 범위 내인지 확인
          if (sourceInfo.pos < 0 || sourceInfo.pos > editor.state.doc.content.size) {
            debugLog('drop', 'WARNING: sourceInfo.pos out of bounds, using fallback');
            sourceParentPos = 0;
          } else {
            sourceResolved = editor.state.doc.resolve(sourceInfo.pos);
            sourceParentPos = sourceInfo.depth > 1 ? sourceResolved.before(sourceInfo.depth - 1) : 0;
          }

          targetResolved = editor.state.doc.resolve(targetInfo.pos);
          targetParentPos = targetInfo.depth > 1 ? targetResolved.before(targetInfo.depth - 1) : 0;
        } catch (e) {
          debugLog('drop', 'WARNING: Could not resolve positions, using depth-based comparison', e);
          // 폴백: 위치 resolve 실패 시 단순 depth 비교
          sourceParentPos = 0;
          targetParentPos = 0;
        }

        debugLog('drop', 'Parent analysis:', {
          sourceParentPos,
          targetParentPos,
          sourceDepth: sourceInfo.depth,
          targetDepth: targetInfo.depth
        });

        const sameParent = sourceParentPos === targetParentPos && sourceInfo.depth === targetInfo.depth;
        const bothAreListItems = DRAGGABLE_ITEM_TYPES.includes(sourceInfo.node.type.name) &&
                                  DRAGGABLE_ITEM_TYPES.includes(targetInfo.node.type.name);
        const isTableRowDrag = nodeTypeName === 'tableRow';

        debugLog('drop', 'Move type:', { sameParent, bothAreListItems, isTableRowDrag });

        // tableRow 특별 처리: 같은 테이블 내에서만 이동 가능
        if (isTableRowDrag) {
          if (!sameParent) {
            debugLog('drop', 'ERROR: tableRow can only be reordered within the same table');
            return;
          }
          if (targetInfo.node.type.name !== 'tableRow') {
            debugLog('drop', 'ERROR: tableRow can only be dropped on another tableRow');
            return;
          }
        }

        if (sameParent && bothAreListItems) {
          // 같은 리스트 내에서 아이템 이동 (taskItem끼리, listItem끼리)
          debugLog('drop', '=== CASE: Same parent, list items ===');
          debugLog('drop', 'Using reconstructed source node');

          const tr = editor.state.tr;

          // 원본 위치에서 소스 노드 삭제 시도 (문서가 변경되지 않았다면 가능)
          let deleteFrom = sourceInfo.pos;
          let deleteTo = sourceInfo.pos + originalNodeSize;

          // 현재 문서에서 해당 위치의 노드 확인
          const currentNodeAtPos = editor.state.doc.nodeAt(sourceInfo.pos);
          if (currentNodeAtPos && currentNodeAtPos.type.name === nodeTypeName) {
            // 원본 위치에 같은 타입의 노드가 있으면 삭제 가능
            deleteTo = sourceInfo.pos + currentNodeAtPos.nodeSize;
            debugLog('drop', 'Original source found at pos, will delete:', { deleteFrom, deleteTo });
          } else {
            debugLog('drop', 'WARNING: Original source not found or type mismatch, skipping delete');
            deleteFrom = -1; // 삭제 스킵 마킹
          }

          if (targetInfo.pos > sourceInfo.pos) {
            // 타겟이 소스 뒤에 있으면 - 타겟 노드 뒤에 삽입 후 원본 삭제
            const insertPos = targetInfo.pos + targetInfo.node.nodeSize;
            debugLog('drop', 'Target is AFTER source');
            debugLog('drop', 'Step 1: Insert at', insertPos);
            tr.insert(insertPos, sourceNode);
            if (deleteFrom >= 0) {
              debugLog('drop', 'Step 2: Delete from', deleteFrom, 'to', deleteTo);
              tr.delete(deleteFrom, deleteTo);
            }
          } else {
            // 타겟이 소스 앞에 있으면 - 원본 삭제 후 타겟 위치에 삽입
            debugLog('drop', 'Target is BEFORE source');
            if (deleteFrom >= 0) {
              debugLog('drop', 'Step 1: Delete from', deleteFrom, 'to', deleteTo);
              tr.delete(deleteFrom, deleteTo);
            }
            debugLog('drop', 'Step 2: Insert at', targetInfo.pos);
            tr.insert(targetInfo.pos, sourceNode);
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (list items)');
        } else if (sameParent) {
          // 같은 부모 내에서 일반 블록 이동
          debugLog('drop', '=== CASE: Same parent, regular blocks ===');
          debugLog('drop', 'Using reconstructed source node');

          const tr = editor.state.tr;

          // 원본 위치에서 소스 노드 삭제 시도
          let deleteFrom = sourceInfo.pos;
          let deleteTo = sourceInfo.pos + originalNodeSize;

          const currentNodeAtPos = editor.state.doc.nodeAt(sourceInfo.pos);
          if (currentNodeAtPos && currentNodeAtPos.type.name === nodeTypeName) {
            deleteTo = sourceInfo.pos + currentNodeAtPos.nodeSize;
            debugLog('drop', 'Original source found at pos, will delete:', { deleteFrom, deleteTo });
          } else {
            debugLog('drop', 'WARNING: Original source not found or type mismatch, skipping delete');
            deleteFrom = -1;
          }

          if (targetInfo.pos > sourceInfo.pos) {
            const insertPos = targetInfo.pos + targetInfo.node.nodeSize;
            debugLog('drop', 'Target is AFTER source');
            debugLog('drop', 'Insert at:', insertPos);
            tr.insert(insertPos, sourceNode);
            if (deleteFrom >= 0) {
              debugLog('drop', 'Delete:', deleteFrom, '-', deleteTo);
              tr.delete(deleteFrom, deleteTo);
            }
          } else {
            debugLog('drop', 'Target is BEFORE source');
            if (deleteFrom >= 0) {
              debugLog('drop', 'Delete:', deleteFrom, '-', deleteTo);
              tr.delete(deleteFrom, deleteTo);
            }
            debugLog('drop', 'Insert at:', targetInfo.pos);
            tr.insert(targetInfo.pos, sourceNode);
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (same parent blocks)');
        } else if (bothAreListItems) {
          // 다른 리스트 간 아이템 이동 (예: taskList A의 item을 taskList B로)
          debugLog('drop', '=== CASE: Different parents, both list items ===');
          debugLog('drop', 'Using reconstructed source node');

          const tr = editor.state.tr;

          // 타겟 위치 계산 - 타겟 아이템 뒤에 삽입
          const insertPos = targetInfo.pos + targetInfo.node.nodeSize;

          // 원본 위치에서 소스 노드 삭제 시도
          let deleteFrom = sourceInfo.pos;
          let deleteTo = sourceInfo.pos + originalNodeSize;

          const currentNodeAtPos = editor.state.doc.nodeAt(sourceInfo.pos);
          if (currentNodeAtPos && currentNodeAtPos.type.name === nodeTypeName) {
            deleteTo = sourceInfo.pos + currentNodeAtPos.nodeSize;
            debugLog('drop', 'Original source found, will delete:', { deleteFrom, deleteTo });
          } else {
            debugLog('drop', 'WARNING: Original source not found, skipping delete');
            deleteFrom = -1;
          }

          debugLog('drop', 'Insert at:', insertPos);

          if (insertPos > sourceInfo.pos) {
            // 타겟이 소스 뒤에 있으면 - 먼저 삽입 후 삭제
            tr.insert(insertPos, sourceNode);
            if (deleteFrom >= 0) {
              tr.delete(deleteFrom, deleteTo);
            }
          } else {
            // 타겟이 소스 앞에 있으면 - 먼저 삭제 후 삽입
            if (deleteFrom >= 0) {
              tr.delete(deleteFrom, deleteTo);
              tr.insert(insertPos, sourceNode);
            } else {
              tr.insert(insertPos, sourceNode);
            }
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (list items between lists)');
        } else if (DRAGGABLE_ITEM_TYPES.includes(nodeTypeName)) {
          // 리스트 아이템을 리스트가 아닌 곳으로 이동 (예: taskItem을 paragraph 위치로)
          debugLog('drop', '=== CASE: List item to non-list location ===');
          debugLog('drop', 'Using reconstructed source node');

          // 소스 아이템의 부모 리스트 타입 확인
          const sourceParentNode = editor.state.doc.nodeAt(sourceParentPos);
          const parentListType = sourceParentNode?.type.name || 'taskList';
          debugLog('drop', 'Parent list type:', parentListType);

          // 타겟의 최상위 블록 위치 계산
          const topTargetResolved = editor.state.doc.resolve(targetInfo.pos);
          const topTargetPos = topTargetResolved.before(1);

          debugLog('drop', 'Target top-level pos:', topTargetPos);

          const tr = editor.state.tr;

          // 원본 위치에서 소스 노드 삭제 시도
          let deleteFrom = sourceInfo.pos;
          let deleteTo = sourceInfo.pos + originalNodeSize;

          const currentNodeAtPos = editor.state.doc.nodeAt(sourceInfo.pos);
          if (currentNodeAtPos && currentNodeAtPos.type.name === nodeTypeName) {
            deleteTo = sourceInfo.pos + currentNodeAtPos.nodeSize;
            debugLog('drop', 'Original source found, will delete:', { deleteFrom, deleteTo });
          } else {
            debugLog('drop', 'WARNING: Original source not found, skipping delete');
            deleteFrom = -1;
          }

          // 새로운 리스트로 래핑하여 삽입
          const listNodeType = editor.schema.nodes[parentListType];
          if (listNodeType) {
            const newListNode = listNodeType.create(null, sourceNode);

            if (topTargetPos > sourceInfo.pos) {
              tr.insert(topTargetPos, newListNode);
              if (deleteFrom >= 0) {
                tr.delete(deleteFrom, deleteTo);
              }
            } else {
              if (deleteFrom >= 0) {
                tr.delete(deleteFrom, deleteTo);
              }
              tr.insert(topTargetPos, newListNode);
            }

            debugLog('drop', 'Created new list wrapper:', parentListType);
          } else {
            debugLog('drop', 'ERROR: Could not find list node type:', parentListType);
            return;
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (list item to non-list)');
        } else {
          // 일반 블록을 다른 위치로 이동
          debugLog('drop', '=== CASE: Different parents - moving blocks ===');
          debugLog('drop', 'Using reconstructed source node');

          // 타겟의 최상위 블록 위치 계산
          const topTargetResolved = editor.state.doc.resolve(targetInfo.pos);
          const topTargetPos = topTargetResolved.before(1);

          const tr = editor.state.tr;

          // 원본 위치에서 소스 노드 삭제 시도
          let deleteFrom = sourceInfo.pos;
          let deleteTo = sourceInfo.pos + originalNodeSize;

          const currentNodeAtPos = editor.state.doc.nodeAt(sourceInfo.pos);
          if (currentNodeAtPos && currentNodeAtPos.type.name === nodeTypeName) {
            deleteTo = sourceInfo.pos + currentNodeAtPos.nodeSize;
            debugLog('drop', 'Original source found, will delete:', { deleteFrom, deleteTo });
          } else {
            debugLog('drop', 'WARNING: Original source not found, skipping delete');
            deleteFrom = -1;
          }

          if (topTargetPos > sourceInfo.pos) {
            tr.insert(topTargetPos, sourceNode);
            if (deleteFrom >= 0) {
              tr.delete(deleteFrom, deleteTo);
            }
          } else {
            if (deleteFrom >= 0) {
              tr.delete(deleteFrom, deleteTo);
            }
            tr.insert(topTargetPos, sourceNode);
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (different parents blocks)');
        }
      } catch (e) {
        debugLog('drop', 'ERROR in drop handler:', e);
        console.error('[DragHandle] Drop error:', e);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('application/x-zm-editor-block')) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        // dragOver는 매우 자주 호출되므로 필요시에만 주석 해제
        // debugLog('dragOver', 'coords:', event.clientX, event.clientY);
      }
    };

    editorElement.addEventListener('drop', handleDrop);
    editorElement.addEventListener('dragover', handleDragOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      editorElement.removeEventListener('drop', handleDrop);
      editorElement.removeEventListener('dragover', handleDragOver);
      cancelHideTimeout();
    };
  }, [editor, handleMouseMove, cancelHideTimeout]);

  if (!visible || !position) {
    // 렌더링하지 않음 - 너무 많이 호출되므로 로그 생략
    // debugLog('render', 'Not rendering - visible:', visible, 'position:', position);
    return null;
  }

  // 핸들이 렌더링될 때 로그
  debugLog('render', '>>> Rendering handle at:', position);

  return (
    <div
      ref={handleRef}
      className="zm-drag-handle"
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 100,
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnterHandle}
      onMouseLeave={handleMouseLeaveHandle}
      title="Drag to reorder"
    >
      <DragIcon />
    </div>
  );
}

function DragIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="5" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="19" r="1" fill="currentColor" />
      <circle cx="15" cy="5" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

export default DragHandle;
