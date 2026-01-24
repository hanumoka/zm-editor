'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

export interface DragHandleProps {
  editor: Editor;
}

/**
 * DragHandle - 블록 드래그 핸들 컴포넌트
 *
 * 블록 왼쪽에 드래그 핸들을 표시하여 블록을 드래그앤드롭으로 이동할 수 있게 합니다.
 */
export function DragHandle({ editor }: DragHandleProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<{ pos: number; node: HTMLElement } | null>(null);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isDragging) return;

      const editorElement = editor.view.dom;
      const editorRect = editorElement.getBoundingClientRect();

      // 에디터 영역 내에서만 처리
      if (
        event.clientX < editorRect.left ||
        event.clientX > editorRect.right ||
        event.clientY < editorRect.top ||
        event.clientY > editorRect.bottom
      ) {
        setVisible(false);
        return;
      }

      // 마우스 위치에서 가장 가까운 블록 노드 찾기
      const pos = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      if (!pos) {
        setVisible(false);
        return;
      }

      // 해당 위치의 노드 찾기
      const resolvedPos = editor.state.doc.resolve(pos.pos);
      let depth = resolvedPos.depth;

      // 최상위 블록 노드 찾기
      while (depth > 0) {
        const node = resolvedPos.node(depth);
        if (node.isBlock) {
          break;
        }
        depth--;
      }

      if (depth === 0) {
        setVisible(false);
        return;
      }

      const nodeStart = resolvedPos.before(depth);
      const dom = editor.view.nodeDOM(nodeStart);

      if (!dom || !(dom instanceof HTMLElement)) {
        setVisible(false);
        return;
      }

      // 테이블 내부, 코드블록 등은 드래그 핸들 숨김
      const node = resolvedPos.node(depth);
      if (
        node.type.name === 'tableCell' ||
        node.type.name === 'tableHeader' ||
        node.type.name === 'tableRow' ||
        node.type.name === 'codeBlock'
      ) {
        setVisible(false);
        return;
      }

      const domRect = dom.getBoundingClientRect();

      currentNodeRef.current = { pos: nodeStart, node: dom };

      setPosition({
        top: domRect.top + window.scrollY,
        left: domRect.left - 28 + window.scrollX,
      });
      setVisible(true);
    },
    [editor, isDragging]
  );

  const handleDragStart = useCallback(
    (event: React.DragEvent) => {
      if (!currentNodeRef.current) return;

      setIsDragging(true);
      event.dataTransfer.effectAllowed = 'move';

      const { pos, node } = currentNodeRef.current;
      const resolvedPos = editor.state.doc.resolve(pos);
      const nodeSize = resolvedPos.nodeAfter?.nodeSize || 0;

      // 드래그 이미지 설정
      const dragImage = node.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px';
      dragImage.style.opacity = '0.8';
      dragImage.style.maxWidth = '300px';
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => document.body.removeChild(dragImage), 0);

      // 드래그 데이터 저장
      event.dataTransfer.setData(
        'application/x-zm-editor-block',
        JSON.stringify({ pos, nodeSize })
      );
    },
    [editor]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const editorElement = editor.view.dom;

    editorElement.addEventListener('mousemove', handleMouseMove);

    // 드롭 처리
    const handleDrop = (event: DragEvent) => {
      const data = event.dataTransfer?.getData('application/x-zm-editor-block');
      if (!data) return;

      event.preventDefault();

      const { pos: sourcePos, nodeSize } = JSON.parse(data);

      // 드롭 위치 계산
      const dropPos = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      if (!dropPos) return;

      const resolvedDropPos = editor.state.doc.resolve(dropPos.pos);
      let targetPos = resolvedDropPos.before(1);

      // 같은 위치면 무시
      if (targetPos === sourcePos) return;

      // 노드 이동
      const sourceNode = editor.state.doc.nodeAt(sourcePos);
      if (!sourceNode) return;

      const tr = editor.state.tr;

      // 삭제 후 삽입 (순서 주의)
      if (targetPos > sourcePos) {
        // 타겟이 소스 뒤에 있으면
        tr.insert(targetPos, sourceNode);
        tr.delete(sourcePos, sourcePos + nodeSize);
      } else {
        // 타겟이 소스 앞에 있으면
        tr.delete(sourcePos, sourcePos + nodeSize);
        tr.insert(targetPos, sourceNode);
      }

      editor.view.dispatch(tr);
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
      editorElement.removeEventListener('mousemove', handleMouseMove);
      editorElement.removeEventListener('drop', handleDrop);
      editorElement.removeEventListener('dragover', handleDragOver);
    };
  }, [editor, handleMouseMove]);

  if (!visible) return null;

  return (
    <div
      ref={handleRef}
      className="zm-drag-handle"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 100,
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
