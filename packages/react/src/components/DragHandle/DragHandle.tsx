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

// 개별 항목으로 드래그 가능한 노드 타입
const DRAGGABLE_ITEM_TYPES = ['taskItem', 'listItem'];
// 드래그 핸들을 표시하지 않을 노드 타입
const NON_DRAGGABLE_TYPES = ['tableCell', 'tableHeader', 'tableRow', 'table'];
// 노드 타입별 추가 오프셋 (미세 조정)
const NODE_TYPE_OFFSETS: Record<string, number> = {
  heading: 0,
  taskItem: 0,
  listItem: 0,
};

// 디버그 모드 플래그
const DEBUG = true;

function debugLog(category: string, ...args: unknown[]) {
  if (DEBUG) {
    console.log(`[DragHandle:${category}]`, ...args);
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
        // 해당 위치의 depth 계산
        const nodeResolvedPos = editor.state.doc.resolve(pos + 1);
        const result = {
          node: nodeAtPos as ProseMirrorNode,
          pos: pos,
          depth: nodeResolvedPos.depth,
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
      if (NON_DRAGGABLE_TYPES.includes(node.type.name)) {
        debugLog('findDraggableNode', 'Top-level node is non-draggable');
        return null;
      }
      const result = {
        node,
        pos: resolvedPos.before(1),
        depth: 1,
      };
      debugLog('findDraggableNode', 'Found top-level block:', {
        type: node.type.name,
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
        isDragging
      });
      if (!isMouseOverHandleRef.current && !isDragging) {
        debugLog('visibility', 'hideWithDelay: >>> HIDING HANDLE <<<');
        setVisible(false);
      } else {
        debugLog('visibility', 'hideWithDelay: Skipped hiding (mouse over handle or dragging)');
      }
    }, HIDE_DELAY);
  }, [cancelHideTimeout, isDragging]);

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
        coordsX = editorRect.left + 10;
        debugLog('mouseMove', 'Mouse in left margin, adjusting X:', {
          originalX: event.clientX,
          adjustedX: coordsX,
          mouseY: event.clientY
        });
      }

      const posAtCoords = editor.view.posAtCoords({
        left: coordsX,
        top: event.clientY,
      });

      if (!posAtCoords) {
        debugLog('mouseMove', 'No position at coords, hiding', { x: event.clientX, y: event.clientY });
        hideWithDelay();
        return;
      }

      const draggableInfo = findDraggableNode(editor, posAtCoords.pos);

      if (!draggableInfo) {
        debugLog('mouseMove', 'No draggable node found, hiding');
        hideWithDelay();
        return;
      }

      const dom = editor.view.nodeDOM(draggableInfo.pos);

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
      const newLeft = Math.max(4, calculatedLeft); // 최소 4px 여백 유지

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
      event.dataTransfer.effectAllowed = 'move';

      const { pos, nodeSize, depth } = currentNodeRef.current;
      debugLog('dragStart', 'Source node:', { pos, nodeSize, depth });

      // 현재 노드 정보 로깅
      const sourceNode = editor.state.doc.nodeAt(pos);
      if (sourceNode) {
        debugLog('dragStart', 'Source node type:', sourceNode.type.name);
        debugLog('dragStart', 'Source node content:', sourceNode.textContent?.substring(0, 50) || '(empty)');
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

      const dragData = JSON.stringify({ pos, nodeSize, depth });
      debugLog('dragStart', 'Setting drag data:', dragData);
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
        const { pos: sourcePos, nodeSize: originalNodeSize, depth: originalDepth } = JSON.parse(data);
        debugLog('drop', 'Parsed source info:', { sourcePos, originalNodeSize, originalDepth });

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
        const targetInfo = findDraggableNode(editor, dropPosInfo.pos);
        if (!targetInfo) {
          debugLog('drop', 'ERROR: Could not find target draggable node');
          return;
        }
        debugLog('drop', 'Target node found:', {
          type: targetInfo.node.type.name,
          pos: targetInfo.pos,
          depth: targetInfo.depth,
          nodeSize: targetInfo.node.nodeSize
        });

        // 소스 노드의 실제 정보 다시 계산 (드래그 중 문서가 변경되었을 수 있음)
        debugLog('drop', '--- Finding source node (re-resolve) ---');
        const sourceInfo = findDraggableNode(editor, sourcePos);
        if (!sourceInfo) {
          debugLog('drop', 'ERROR: Could not find source node at original position', sourcePos);
          debugLog('drop', 'Document may have changed during drag');
          return;
        }
        debugLog('drop', 'Source node found:', {
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
        const sourceResolved = editor.state.doc.resolve(sourceInfo.pos);
        const targetResolved = editor.state.doc.resolve(targetInfo.pos);

        const sourceParentPos = sourceInfo.depth > 1 ? sourceResolved.before(sourceInfo.depth - 1) : 0;
        const targetParentPos = targetInfo.depth > 1 ? targetResolved.before(targetInfo.depth - 1) : 0;

        debugLog('drop', 'Parent analysis:', {
          sourceParentPos,
          targetParentPos,
          sourceDepth: sourceInfo.depth,
          targetDepth: targetInfo.depth
        });

        const sameParent = sourceParentPos === targetParentPos && sourceInfo.depth === targetInfo.depth;
        const bothAreListItems = DRAGGABLE_ITEM_TYPES.includes(sourceInfo.node.type.name) &&
                                  DRAGGABLE_ITEM_TYPES.includes(targetInfo.node.type.name);

        debugLog('drop', 'Move type:', { sameParent, bothAreListItems });

        if (sameParent && bothAreListItems) {
          // 같은 리스트 내에서 아이템 이동 (taskItem끼리, listItem끼리)
          debugLog('drop', '=== CASE: Same parent, list items ===');
          const sourceSlice = editor.state.doc.slice(sourceInfo.pos, sourceInfo.pos + sourceInfo.node.nodeSize);
          debugLog('drop', 'Source slice created:', {
            from: sourceInfo.pos,
            to: sourceInfo.pos + sourceInfo.node.nodeSize,
            content: sourceSlice.content.toString().substring(0, 100)
          });

          const tr = editor.state.tr;

          if (targetInfo.pos > sourceInfo.pos) {
            // 타겟이 소스 뒤에 있으면 - 타겟 노드 뒤에 삽입 후 원본 삭제
            const insertPos = targetInfo.pos + targetInfo.node.nodeSize;
            debugLog('drop', 'Target is AFTER source');
            debugLog('drop', 'Step 1: Insert at', insertPos);
            debugLog('drop', 'Step 2: Delete from', sourceInfo.pos, 'to', sourceInfo.pos + sourceInfo.node.nodeSize);
            tr.insert(insertPos, sourceSlice.content);
            tr.delete(sourceInfo.pos, sourceInfo.pos + sourceInfo.node.nodeSize);
          } else {
            // 타겟이 소스 앞에 있으면 - 원본 삭제 후 타겟 위치에 삽입
            debugLog('drop', 'Target is BEFORE source');
            debugLog('drop', 'Step 1: Delete from', sourceInfo.pos, 'to', sourceInfo.pos + sourceInfo.node.nodeSize);
            debugLog('drop', 'Step 2: Insert at', targetInfo.pos);
            tr.delete(sourceInfo.pos, sourceInfo.pos + sourceInfo.node.nodeSize);
            tr.insert(targetInfo.pos, sourceSlice.content);
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (list items)');
        } else if (sameParent) {
          // 같은 부모 내에서 일반 블록 이동
          debugLog('drop', '=== CASE: Same parent, regular blocks ===');
          const sourceSlice = editor.state.doc.slice(sourceInfo.pos, sourceInfo.pos + sourceInfo.node.nodeSize);
          debugLog('drop', 'Source slice created');

          const tr = editor.state.tr;

          if (targetInfo.pos > sourceInfo.pos) {
            const insertPos = targetInfo.pos + targetInfo.node.nodeSize;
            debugLog('drop', 'Target is AFTER source');
            debugLog('drop', 'Insert at:', insertPos, 'Delete:', sourceInfo.pos, '-', sourceInfo.pos + sourceInfo.node.nodeSize);
            tr.insert(insertPos, sourceSlice.content);
            tr.delete(sourceInfo.pos, sourceInfo.pos + sourceInfo.node.nodeSize);
          } else {
            debugLog('drop', 'Target is BEFORE source');
            debugLog('drop', 'Delete:', sourceInfo.pos, '-', sourceInfo.pos + sourceInfo.node.nodeSize, 'Insert at:', targetInfo.pos);
            tr.delete(sourceInfo.pos, sourceInfo.pos + sourceInfo.node.nodeSize);
            tr.insert(targetInfo.pos, sourceSlice.content);
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (same parent blocks)');
        } else {
          // 다른 부모로 이동하는 경우 - 최상위 블록 단위로 이동
          debugLog('drop', '=== CASE: Different parents - moving top-level blocks ===');
          const topSourceResolved = editor.state.doc.resolve(sourcePos);
          const topTargetResolved = editor.state.doc.resolve(targetInfo.pos);

          const topSourcePos = topSourceResolved.before(1);
          const topTargetPos = topTargetResolved.before(1);

          debugLog('drop', 'Top-level positions:', { topSourcePos, topTargetPos });

          if (topSourcePos === topTargetPos) {
            debugLog('drop', 'Same top-level block, ignoring');
            return;
          }

          const topSourceNode = editor.state.doc.nodeAt(topSourcePos);
          if (!topSourceNode) {
            debugLog('drop', 'ERROR: Could not get top source node');
            return;
          }

          debugLog('drop', 'Top source node:', {
            type: topSourceNode.type.name,
            nodeSize: topSourceNode.nodeSize
          });

          const topSourceSlice = editor.state.doc.slice(topSourcePos, topSourcePos + topSourceNode.nodeSize);

          const tr = editor.state.tr;

          if (topTargetPos > topSourcePos) {
            debugLog('drop', 'Top target is AFTER top source');
            debugLog('drop', 'Insert at:', topTargetPos, 'Delete:', topSourcePos, '-', topSourcePos + topSourceNode.nodeSize);
            tr.insert(topTargetPos, topSourceSlice.content);
            tr.delete(topSourcePos, topSourcePos + topSourceNode.nodeSize);
          } else {
            debugLog('drop', 'Top target is BEFORE top source');
            debugLog('drop', 'Delete:', topSourcePos, '-', topSourcePos + topSourceNode.nodeSize, 'Insert at:', topTargetPos);
            tr.delete(topSourcePos, topSourcePos + topSourceNode.nodeSize);
            tr.insert(topTargetPos, topSourceSlice.content);
          }

          debugLog('drop', 'Dispatching transaction...');
          editor.view.dispatch(tr);
          debugLog('drop', 'Transaction dispatched successfully');
          debugDocumentStructure(editor, 'AFTER DROP (different parents)');
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
