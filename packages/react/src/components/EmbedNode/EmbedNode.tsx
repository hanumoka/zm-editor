import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseEmbedUrl, getEmbedLabel, type EmbedType } from './embed-utils';

export type EmbedNodeProps = NodeViewProps;

/**
 * EmbedNode - YouTube, Vimeo, Twitter 등 임베드 NodeView
 */
export function EmbedNode({ node, updateAttributes, selected }: EmbedNodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { src, embedType, embedUrl, aspectRatio = '16/9', caption = '' } = node.attrs;

  // 캡션 편집 상태
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(caption);
  const captionInputRef = useRef<HTMLInputElement>(null);

  // URL 입력 상태 (hydration 불일치 방지를 위해 초기값 false)
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlValue, setUrlValue] = useState(src || '');

  // 클라이언트 마운트 후 초기 편집 상태 설정
  useEffect(() => {
    if (!src) {
      setIsEditingUrl(true);
    }
  }, []);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // caption 속성이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setCaptionValue(caption);
  }, [caption]);

  // src가 변경되면 URL 값 동기화
  useEffect(() => {
    setUrlValue(src || '');
    if (src) {
      setIsEditingUrl(false);
    }
  }, [src]);

  // URL 저장 및 파싱
  const handleUrlSave = useCallback(() => {
    const trimmedUrl = urlValue.trim();
    if (!trimmedUrl) {
      return;
    }

    const embedInfo = parseEmbedUrl(trimmedUrl);
    updateAttributes({
      src: trimmedUrl,
      embedType: embedInfo.type,
      embedUrl: embedInfo.embedUrl,
      aspectRatio: embedInfo.aspectRatio || '16/9',
    });
    setIsEditingUrl(false);
  }, [urlValue, updateAttributes]);

  // URL 입력 키 핸들러
  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUrlSave();
      } else if (e.key === 'Escape') {
        if (src) {
          setUrlValue(src);
          setIsEditingUrl(false);
        }
      }
    },
    [handleUrlSave, src]
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
    setTimeout(() => captionInputRef.current?.focus(), 0);
  }, []);

  // URL 편집 시작
  const handleEditUrl = useCallback(() => {
    setIsEditingUrl(true);
    setTimeout(() => urlInputRef.current?.focus(), 0);
  }, []);

  // 포커스 시 URL 입력에 포커스
  useEffect(() => {
    if (isEditingUrl && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [isEditingUrl]);

  // URL 입력 모드
  if (isEditingUrl || !src) {
    return (
      <NodeViewWrapper className="zm-embed-node-wrapper">
        <div
          ref={containerRef}
          className={`zm-embed-node zm-embed-input-mode ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-embed-input-container">
            <EmbedIcon />
            <input
              ref={urlInputRef}
              type="text"
              className="zm-embed-url-input"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onBlur={handleUrlSave}
              onKeyDown={handleUrlKeyDown}
              placeholder="Paste YouTube, Vimeo, CodePen, or CodeSandbox URL..."
            />
          </div>
          <div className="zm-embed-input-hint">
            Supported: YouTube, Vimeo, Twitter/X, CodePen, CodeSandbox
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Twitter는 iframe 미지원, 링크로 표시
  if (embedType === 'twitter') {
    return (
      <NodeViewWrapper className="zm-embed-node-wrapper">
        <div
          ref={containerRef}
          className={`zm-embed-node zm-embed-twitter ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="zm-embed-twitter-link"
          >
            <TwitterIcon />
            <span>View on Twitter/X</span>
          </a>

          {/* 선택 시 툴바 */}
          {selected && (
            <div className="zm-embed-toolbar">
              <button
                type="button"
                className="zm-embed-toolbar-btn"
                onClick={handleEditUrl}
                title="Edit URL"
              >
                <EditIcon />
              </button>
            </div>
          )}

          {/* 캡션 */}
          {(selected || caption) && (
            <div className="zm-embed-caption">
              {isEditingCaption ? (
                <input
                  ref={captionInputRef}
                  type="text"
                  className="zm-embed-caption-input"
                  value={captionValue}
                  onChange={(e) => setCaptionValue(e.target.value)}
                  onBlur={handleCaptionSave}
                  onKeyDown={handleCaptionKeyDown}
                  placeholder="Add a caption..."
                />
              ) : (
                <span className="zm-embed-caption-text" onClick={handleCaptionClick}>
                  {caption || 'Add a caption...'}
                </span>
              )}
            </div>
          )}
        </div>
      </NodeViewWrapper>
    );
  }

  // iframe 임베드 (YouTube, Vimeo, CodePen, CodeSandbox)
  return (
    <NodeViewWrapper className="zm-embed-node-wrapper">
      <div
        ref={containerRef}
        className={`zm-embed-node ${selected ? 'is-selected' : ''}`}
        data-drag-handle
      >
        {/* 임베드 타입 라벨 */}
        <div className="zm-embed-label">
          {getEmbedLabel(embedType as EmbedType)}
        </div>

        {/* iframe 컨테이너 */}
        <div
          className="zm-embed-iframe-container"
          style={{ aspectRatio }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="zm-embed-iframe"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${embedType} embed`}
            />
          ) : (
            <div className="zm-embed-error">
              Unable to embed this URL
            </div>
          )}
        </div>

        {/* 선택 시 툴바 */}
        {selected && (
          <div className="zm-embed-toolbar">
            <button
              type="button"
              className="zm-embed-toolbar-btn"
              onClick={handleEditUrl}
              title="Edit URL"
            >
              <EditIcon />
            </button>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="zm-embed-toolbar-btn"
              title="Open in new tab"
            >
              <ExternalLinkIcon />
            </a>
          </div>
        )}

        {/* 캡션 */}
        {(selected || caption) && (
          <div className="zm-embed-caption">
            {isEditingCaption ? (
              <input
                ref={captionInputRef}
                type="text"
                className="zm-embed-caption-input"
                value={captionValue}
                onChange={(e) => setCaptionValue(e.target.value)}
                onBlur={handleCaptionSave}
                onKeyDown={handleCaptionKeyDown}
                placeholder="Add a caption..."
              />
            ) : (
              <span className="zm-embed-caption-text" onClick={handleCaptionClick}>
                {caption || 'Add a caption...'}
              </span>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// Icons
function EmbedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default EmbedNode;
