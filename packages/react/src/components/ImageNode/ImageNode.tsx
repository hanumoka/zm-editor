import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type ImageNodeProps = NodeViewProps;

type ResizeDirection = 'left' | 'right';

/**
 * ImageNode - Notion-like 이미지 리사이즈 가능한 NodeView
 */
export function ImageNode({ node, updateAttributes, selected }: ImageNodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);

  // 리사이즈 시작 시점의 초기값 저장 (중앙/우측 정렬에서 안정적인 리사이즈를 위함)
  const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const { src, alt, title, width, alignment = 'center' } = node.attrs;

  // 이미지 로드 시 초기 크기 설정
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth } = imageRef.current;

      // 초기 width가 없으면 자연 크기의 100% 또는 컨테이너 너비
      if (!width && containerRef.current) {
        const containerWidth = containerRef.current.parentElement?.clientWidth || 800;
        const initialWidth = Math.min(naturalWidth, containerWidth * 0.9);
        updateAttributes({ width: initialWidth });
      }
    }
  }, [width, updateAttributes]);

  // 리사이즈 시작
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.preventDefault();
      e.stopPropagation();

      // 시작 시점의 마우스 위치와 현재 너비 저장
      const currentWidth = width || containerRef.current?.offsetWidth || 300;
      resizeStartRef.current = {
        startX: e.clientX,
        startWidth: currentWidth,
      };

      setIsResizing(true);
      setResizeDirection(direction);
    },
    [width]
  );

  // 리사이즈 중
  useEffect(() => {
    if (!isResizing || !resizeDirection || !resizeStartRef.current) return;

    const { startX, startWidth } = resizeStartRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const parentWidth = containerRef.current.parentElement?.clientWidth || 800;

      // 마우스 이동량 계산
      const deltaX = e.clientX - startX;

      // 방향에 따라 너비 계산
      // right: 오른쪽으로 드래그하면 커짐 (+deltaX)
      // left: 왼쪽으로 드래그하면 커짐 (-deltaX)
      const newWidth = resizeDirection === 'right'
        ? startWidth + deltaX
        : startWidth - deltaX;

      // 최소/최대 제한
      const minWidth = 100;
      const maxWidth = parentWidth * 0.95;
      const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

      updateAttributes({ width: Math.round(clampedWidth) });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeDirection(null);
      resizeStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeDirection, updateAttributes]);

  // 정렬 변경
  const handleAlignmentChange = useCallback(
    (newAlignment: 'left' | 'center' | 'right') => {
      updateAttributes({ alignment: newAlignment });
    },
    [updateAttributes]
  );

  const alignmentStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent:
      alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
  };

  return (
    <NodeViewWrapper className="zm-image-node-wrapper" style={alignmentStyle}>
      <div
        ref={containerRef}
        className={`zm-image-node ${selected ? 'is-selected' : ''} ${isResizing ? 'is-resizing' : ''}`}
        style={{ width: width ? `${width}px` : 'auto' }}
        data-drag-handle
      >
        {/* 이미지 */}
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          onLoad={handleImageLoad}
          className="zm-image-node-img"
          draggable={false}
        />

        {/* 선택 시 오버레이 및 컨트롤 */}
        {selected && (
          <>
            {/* 리사이즈 핸들 */}
            <div
              className="zm-image-resize-handle zm-image-resize-handle-left"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            >
              <div className="zm-image-resize-handle-bar" />
            </div>
            <div
              className="zm-image-resize-handle zm-image-resize-handle-right"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            >
              <div className="zm-image-resize-handle-bar" />
            </div>

            {/* 정렬 툴바 */}
            <div className="zm-image-toolbar">
              <button
                type="button"
                className={`zm-image-toolbar-btn ${alignment === 'left' ? 'is-active' : ''}`}
                onClick={() => handleAlignmentChange('left')}
                title="Align left"
              >
                <AlignLeftIcon />
              </button>
              <button
                type="button"
                className={`zm-image-toolbar-btn ${alignment === 'center' ? 'is-active' : ''}`}
                onClick={() => handleAlignmentChange('center')}
                title="Align center"
              >
                <AlignCenterIcon />
              </button>
              <button
                type="button"
                className={`zm-image-toolbar-btn ${alignment === 'right' ? 'is-active' : ''}`}
                onClick={() => handleAlignmentChange('right')}
                title="Align right"
              >
                <AlignRightIcon />
              </button>
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// Icons
function AlignLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="6" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default ImageNode;
