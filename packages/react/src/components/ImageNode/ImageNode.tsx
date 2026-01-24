import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isSafeImageUrl } from '@zm-editor/core';
import { useLocale } from '../../context/LocaleContext';

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
  const locale = useLocale();

  // 리사이즈 시작 시점의 초기값 저장 (중앙/우측 정렬에서 안정적인 리사이즈를 위함)
  const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const { src, alt, title, width, alignment = 'center', caption = '' } = node.attrs;

  // Alt 텍스트 편집 상태
  const [isEditingAlt, setIsEditingAlt] = useState(false);
  const [altValue, setAltValue] = useState(alt || '');
  const altInputRef = useRef<HTMLInputElement>(null);

  // alt 속성이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setAltValue(alt || '');
  }, [alt]);

  // SSRF/URL 검증 (개발 환경에서 localhost 허용)
  const urlValidation = useMemo(
    () => isSafeImageUrl(src, {
      allowDataUrls: true,
      allowBlobUrls: true,
      blockPrivateIPs: true,
      blockLocalhost: false,  // 개발 환경을 위해 localhost 허용
    }),
    [src]
  );

  // 캡션 편집 상태
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(caption);
  const captionInputRef = useRef<HTMLInputElement>(null);

  // caption 속성이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setCaptionValue(caption);
  }, [caption]);

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

  // 캡션 저장
  const handleCaptionSave = useCallback(() => {
    updateAttributes({ caption: captionValue });
    setIsEditingCaption(false);
  }, [captionValue, updateAttributes]);

  // 캡션 입력 키 핸들러
  const handleCaptionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCaptionSave();
      } else if (e.key === 'Escape') {
        setCaptionValue(caption);
        setIsEditingCaption(false);
      }
    },
    [handleCaptionSave, caption]
  );

  // 캡션 편집 시작
  const handleCaptionClick = useCallback(() => {
    setIsEditingCaption(true);
    // 다음 렌더 후 input에 포커스
    setTimeout(() => captionInputRef.current?.focus(), 0);
  }, []);

  // Alt 텍스트 편집 시작
  const handleAltTextEdit = useCallback(() => {
    setIsEditingAlt(true);
    setTimeout(() => altInputRef.current?.focus(), 0);
  }, []);

  // Alt 텍스트 저장
  const handleAltSave = useCallback(() => {
    updateAttributes({ alt: altValue });
    setIsEditingAlt(false);
  }, [altValue, updateAttributes]);

  // Alt 텍스트 입력 키 핸들러
  const handleAltKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAltSave();
      } else if (e.key === 'Escape') {
        setAltValue(alt || '');
        setIsEditingAlt(false);
      }
    },
    [handleAltSave, alt]
  );

  const alignmentStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent:
      alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
  };

  // URL 검증 실패 시 오류 표시
  if (!urlValidation.isValid && src) {
    return (
      <NodeViewWrapper className="zm-image-node-wrapper" style={alignmentStyle}>
        <div
          ref={containerRef}
          className={`zm-image-node zm-image-node-error ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-image-error-content">
            <InvalidImageIcon />
            <span className="zm-image-error-message">
              {urlValidation.errorMessage || 'Invalid image URL'}
            </span>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

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
              <div className="zm-image-toolbar-divider" />
              <button
                type="button"
                className="zm-image-toolbar-btn"
                onClick={handleAltTextEdit}
                title="Edit alt text"
              >
                <AltTextIcon />
              </button>
            </div>
          </>
        )}

        {/* 캡션 (선택 시 또는 캡션이 있을 때 표시) */}
        {(selected || caption) && (
          <div className="zm-image-caption">
            {isEditingCaption ? (
              <input
                ref={captionInputRef}
                type="text"
                className="zm-image-caption-input"
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                onBlur={handleCaptionSave}
                onKeyDown={handleCaptionKeyDown}
                placeholder={locale?.nodes?.image?.addCaption || 'Add a caption...'}
              />
            ) : (
              <span
                className="zm-image-caption-text"
                onClick={handleCaptionClick}
              >
                {caption || (locale?.nodes?.image?.addCaption || 'Add a caption...')}
              </span>
            )}
          </div>
        )}

        {/* Alt 텍스트 (선택 시 표시) */}
        {selected && (
          <div className="zm-image-alt-text">
            {isEditingAlt ? (
              <input
                ref={altInputRef}
                type="text"
                className="zm-image-alt-input"
                value={altValue}
                onChange={(e) => setAltValue(e.target.value)}
                onBlur={handleAltSave}
                onKeyDown={handleAltKeyDown}
                placeholder={locale?.nodes?.image?.altTextPlaceholder || 'Describe this image...'}
              />
            ) : (
              <span
                className="zm-image-alt-text-content"
                onClick={handleAltTextEdit}
              >
                <AltTextIcon />
                <span className="zm-image-alt-label">
                  {alt || (locale?.nodes?.image?.altTextPlaceholder || 'Describe this image...')}
                </span>
              </span>
            )}
          </div>
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

function AltTextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <text x="12" y="15" fontSize="8" textAnchor="middle" fill="currentColor" stroke="none">Alt</text>
    </svg>
  );
}

function InvalidImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="3" x2="21" y2="21" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export default ImageNode;
