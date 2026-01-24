'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

export interface DragHandleProps {
  editor: Editor;
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

/**
 * 드래그 가능한 노드와 위치를 찾습니다.
 */
function findDraggableNode(
  editor: Editor,
  pos: number
): { node: ProseMirrorNode; pos: number; depth: number } | null {
  try {
    const resolvedPos = editor.state.doc.resolve(pos);

    // depth를 순회하며 드래그 가능한 노드 찾기
    for (let d = resolvedPos.depth; d >= 1; d--) {
      const node = resolvedPos.node(d);
      const nodeTypeName = node.type.name;

      // 드래그 불가 노드 내부면 null 반환
      if (NON_DRAGGABLE_TYPES.includes(nodeTypeName)) {
        return null;
      }

      // 개별 항목 타입이면 해당 항목 반환
      if (DRAGGABLE_ITEM_TYPES.includes(nodeTypeName)) {
        return {
          node,
          pos: resolvedPos.before(d),
          depth: d,
        };
      }
    }

    // 최상위 블록 (depth 1) 반환
    if (resolvedPos.depth >= 1) {
      const node = resolvedPos.node(1);
      if (NON_DRAGGABLE_TYPES.includes(node.type.name)) {
        return null;
      }
      return {
        node,
        pos: resolvedPos.before(1),
        depth: 1,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 요소의 첫 번째 텍스트 라인 위치를 찾습니다.
 */
function getFirstLineTop(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  // margin-top은 getBoundingClientRect에 포함되지 않음
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;

  // 텍스트가 있는 첫 번째 자식 요소 찾기
  const firstTextElement = findFirstTextElement(element);

  if (firstTextElement && firstTextElement !== element) {
    const firstTextRect = firstTextElement.getBoundingClientRect();
    // 첫 번째 텍스트 요소의 상단 위치 사용
    return firstTextRect.top;
  }

  // 텍스트 요소를 찾지 못하면 padding + border 이후 위치 반환
  return rect.top + paddingTop + borderTop;
}

/**
 * 요소 내에서 첫 번째 텍스트를 포함한 요소를 찾습니다.
 */
function findFirstTextElement(element: HTMLElement): HTMLElement | null {
  // 체크박스나 라벨은 건너뛰기
  if (element.tagName === 'INPUT' || element.tagName === 'LABEL') {
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
      // input, label 등 건너뛰기
      if (child.tagName === 'INPUT' || child.tagName === 'LABEL') {
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
 * 텍스트 라인 높이를 계산합니다.
 */
function getLineHeight(element: HTMLElement): number {
  const style = window.getComputedStyle(element);
  const lineHeight = style.lineHeight;

  if (lineHeight === 'normal') {
    // normal인 경우 font-size * 1.2 사용
    const fontSize = parseFloat(style.fontSize) || 16;
    return fontSize * 1.2;
  }

  const parsed = parseFloat(lineHeight);
  return isNaN(parsed) ? 24 : parsed;
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
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const hideWithDelay = useCallback(() => {
    cancelHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      if (!isMouseOverHandleRef.current && !isDragging) {
        setVisible(false);
      }
    }, HIDE_DELAY);
  }, [cancelHideTimeout, isDragging]);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging) return;

      const editorElement = editor.view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      if (handleRef.current?.contains(event.target as Node)) {
        cancelHideTimeout();
        return;
      }

      const isInEditorArea =
        event.clientX >= editorRect.left - HANDLE_LEFT_OFFSET &&
        event.clientX <= editorRect.right &&
        event.clientY >= editorRect.top &&
        event.clientY <= editorRect.bottom;

      if (!isInEditorArea) {
        hideWithDelay();
        return;
      }

      if (event.clientX < editorRect.left) {
        cancelHideTimeout();
        return;
      }

      const posAtCoords = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      if (!posAtCoords) {
        hideWithDelay();
        return;
      }

      const draggableInfo = findDraggableNode(editor, posAtCoords.pos);

      if (!draggableInfo) {
        hideWithDelay();
        return;
      }

      const dom = editor.view.nodeDOM(draggableInfo.pos);

      if (!dom || !(dom instanceof HTMLElement)) {
        hideWithDelay();
        return;
      }

      currentNodeRef.current = {
        pos: draggableInfo.pos,
        nodeSize: draggableInfo.node.nodeSize,
        depth: draggableInfo.depth,
      };

      cancelHideTimeout();

      // 첫 번째 텍스트 라인의 상단 위치 찾기
      const firstLineTop = getFirstLineTop(dom);

      // 해당 요소 또는 첫 번째 텍스트 요소의 라인 높이 가져오기
      const textElement = findFirstTextElement(dom) || dom;
      const lineHeight = getLineHeight(textElement);

      // 핸들을 텍스트 라인 중앙에 배치
      const verticalOffset = Math.max(0, (lineHeight - HANDLE_SIZE) / 2);

      setPosition({
        top: firstLineTop + verticalOffset,
        left: editorRect.left - HANDLE_LEFT_OFFSET,
      });
      setVisible(true);
    },
    [editor, isDragging, cancelHideTimeout, hideWithDelay]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      if (!currentNodeRef.current) return;

      setIsDragging(true);
      event.dataTransfer.effectAllowed = 'move';

      const { pos, nodeSize, depth } = currentNodeRef.current;

      const dom = editor.view.nodeDOM(pos);
      if (dom instanceof HTMLElement) {
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
      }

      event.dataTransfer.setData(
        'application/x-zm-editor-block',
        JSON.stringify({ pos, nodeSize, depth })
      );
    },
    [editor]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setVisible(false);
  }, []);

  const handleMouseEnterHandle = useCallback(() => {
    isMouseOverHandleRef.current = true;
    cancelHideTimeout();
  }, [cancelHideTimeout]);

  const handleMouseLeaveHandle = useCallback(() => {
    isMouseOverHandleRef.current = false;
    hideWithDelay();
  }, [hideWithDelay]);

  useEffect(() => {
    const editorElement = editor.view.dom;

    document.addEventListener('mousemove', handleMouseMove);

    const handleDrop = (event: DragEvent) => {
      const data = event.dataTransfer?.getData('application/x-zm-editor-block');
      if (!data) return;

      event.preventDefault();

      try {
        const { pos: sourcePos, nodeSize: sourceNodeSize } = JSON.parse(data);

        const dropPosInfo = editor.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });

        if (!dropPosInfo) return;

        // 드롭 대상 노드 찾기
        const targetInfo = findDraggableNode(editor, dropPosInfo.pos);
        if (!targetInfo) return;

        // 소스 노드 정보 다시 확인 (드래그 중 문서가 변경되었을 수 있음)
        const sourceNode = editor.state.doc.nodeAt(sourcePos);
        if (!sourceNode) return;

        // 같은 위치면 무시
        if (targetInfo.pos === sourcePos) return;

        // 소스 노드의 실제 정보 다시 계산
        const sourceInfo = findDraggableNode(editor, sourcePos);
        if (!sourceInfo) return;

        const tr = editor.state.tr;

        // 같은 부모 내에서 이동하는지 확인
        const sourceResolved = editor.state.doc.resolve(sourceInfo.pos);
        const targetResolved = editor.state.doc.resolve(targetInfo.pos);

        const sourceParentPos = sourceInfo.depth > 1 ? sourceResolved.before(sourceInfo.depth - 1) : 0;
        const targetParentPos = targetInfo.depth > 1 ? targetResolved.before(targetInfo.depth - 1) : 0;

        const sameParent = sourceParentPos === targetParentPos && sourceInfo.depth === targetInfo.depth;

        if (sameParent) {
          // 같은 부모 내에서 이동 (taskItem끼리, listItem끼리)
          const actualSourceSize = sourceInfo.node.nodeSize;

          if (targetInfo.pos > sourceInfo.pos) {
            // 타겟이 소스 뒤에 있으면 - 타겟 노드 뒤에 삽입
            const insertPos = targetInfo.pos + targetInfo.node.nodeSize;
            tr.insert(insertPos, sourceInfo.node);
            tr.delete(sourceInfo.pos, sourceInfo.pos + actualSourceSize);
          } else {
            // 타겟이 소스 앞에 있으면 - 타겟 노드 앞에 삽입
            tr.delete(sourceInfo.pos, sourceInfo.pos + actualSourceSize);
            tr.insert(targetInfo.pos, sourceInfo.node);
          }
        } else {
          // 다른 부모로 이동하는 경우 - 최상위 블록 단위로 이동
          const topSourceResolved = editor.state.doc.resolve(sourcePos);
          const topTargetResolved = editor.state.doc.resolve(targetInfo.pos);

          const topSourcePos = topSourceResolved.before(1);
          const topTargetPos = topTargetResolved.before(1);

          if (topSourcePos === topTargetPos) return;

          const topSourceNode = editor.state.doc.nodeAt(topSourcePos);
          if (!topSourceNode) return;

          const topSourceSize = topSourceNode.nodeSize;

          if (topTargetPos > topSourcePos) {
            tr.insert(topTargetPos, topSourceNode);
            tr.delete(topSourcePos, topSourcePos + topSourceSize);
          } else {
            tr.delete(topSourcePos, topSourcePos + topSourceSize);
            tr.insert(topTargetPos, topSourceNode);
          }
        }

        editor.view.dispatch(tr);
      } catch (e) {
        console.error('[DragHandle] Drop error:', e);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('application/x-zm-editor-block')) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
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

  if (!visible || !position) return null;

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
