import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';
import { isSafeLinkUrl, getSafeHref, normalizeUrl } from '@zm-editor/core';

export type BookmarkNodeProps = NodeViewProps;

/**
 * URL에서 도메인 추출
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * 기본 파비콘 URL 생성
 */
function getDefaultFavicon(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
}

/**
 * BookmarkNode - 링크 미리보기 카드 NodeView
 */
export function BookmarkNode({ node, updateAttributes, selected }: BookmarkNodeProps) {
  const locale = useLocale();
  const { url, title, description, image, favicon, siteName, caption = '' } = node.attrs;

  // URL 입력 상태 (hydration 불일치 방지를 위해 초기값 false)
  const [isEditing, setIsEditing] = useState(false);
  const [urlValue, setUrlValue] = useState(url || '');

  // 클라이언트 마운트 후 초기 편집 상태 설정
  useEffect(() => {
    if (!url) {
      setIsEditing(true);
    }
  }, []);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // 캡션 편집 상태
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(caption);
  const captionInputRef = useRef<HTMLInputElement>(null);

  // 이미지 로드 에러 상태 (DOM 직접 조작 대신 상태로 관리)
  const [faviconError, setFaviconError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // URL 동기화
  useEffect(() => {
    setUrlValue(url || '');
    if (url) {
      setIsEditing(false);
    }
  }, [url]);

  // 이미지 소스 변경 시 에러 상태 초기화
  useEffect(() => {
    setFaviconError(false);
  }, [favicon, url]);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  // 캡션 동기화
  useEffect(() => {
    setCaptionValue(caption);
  }, [caption]);

  // URL 저장
  const handleUrlSave = useCallback(() => {
    const trimmedUrl = urlValue.trim();
    if (!trimmedUrl) {
      return;
    }

    // URL 정규화 (http/https 없으면 추가)
    const normalizedUrlValue = normalizeUrl(trimmedUrl);

    // 안전한 URL인지 검증 (javascript:, data: 등 차단)
    if (!isSafeLinkUrl(normalizedUrlValue)) {
      // 위험한 URL은 저장하지 않음
      return;
    }

    updateAttributes({
      url: normalizedUrlValue,
      // 기본값 설정
      title: title || extractDomain(normalizedUrlValue),
      favicon: favicon || getDefaultFavicon(normalizedUrlValue),
    });
    setIsEditing(false);
  }, [urlValue, title, favicon, updateAttributes]);

  // URL 입력 키 핸들러
  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleUrlSave();
      } else if (e.key === 'Escape') {
        if (url) {
          setUrlValue(url);
          setIsEditing(false);
        }
      }
    },
    [handleUrlSave, url]
  );

  // 편집 모드 시작
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => urlInputRef.current?.focus(), 0);
  }, []);

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

  // 포커스 처리
  useEffect(() => {
    if (isEditing && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [isEditing]);

  // URL 입력 모드
  if (isEditing || !url) {
    return (
      <NodeViewWrapper className="zm-bookmark-node-wrapper">
        <div
          className={`zm-bookmark-node zm-bookmark-input-mode ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-bookmark-input-container">
            <LinkIcon />
            <input
              ref={urlInputRef}
              type="text"
              className="zm-bookmark-url-input"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onBlur={handleUrlSave}
              onKeyDown={handleUrlKeyDown}
              placeholder={locale.nodes.bookmark.placeholder}
            />
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // 카드 미리보기 모드
  const displayFavicon = favicon || getDefaultFavicon(url);
  const displayTitle = title || extractDomain(url);
  const displaySiteName = siteName || extractDomain(url);

  // 안전한 href (XSS 방지)
  const safeHref = getSafeHref(url);

  return (
    <NodeViewWrapper className="zm-bookmark-node-wrapper">
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`zm-bookmark-node zm-bookmark-card ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={(e) => {
          // 선택 상태에서는 링크 이동 방지, 안전하지 않은 URL도 방지
          if (selected || !safeHref) {
            e.preventDefault();
          }
        }}
      >
        {/* 텍스트 영역 */}
        <div className="zm-bookmark-content">
          <div className="zm-bookmark-title">{displayTitle}</div>
          {description && (
            <div className="zm-bookmark-description">{description}</div>
          )}
          <div className="zm-bookmark-meta">
            {displayFavicon && !faviconError && (
              <img
                src={displayFavicon}
                alt=""
                className="zm-bookmark-favicon"
                onError={() => setFaviconError(true)}
              />
            )}
            <span className="zm-bookmark-site">{displaySiteName}</span>
          </div>
        </div>

        {/* 이미지 영역 */}
        {image && !imageError && (
          <div className="zm-bookmark-image-container">
            <img
              src={image}
              alt=""
              className="zm-bookmark-image"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </a>

      {/* 선택 시 편집 버튼 */}
      {selected && (
        <div className="zm-bookmark-toolbar">
          <button
            type="button"
            className="zm-bookmark-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes.bookmark.editUrl}
          >
            <EditIcon />
          </button>
          <a
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="zm-bookmark-toolbar-btn"
            title={locale.nodes.bookmark.openInNewTab}
            onClick={(e) => {
              // 안전하지 않은 URL 클릭 방지
              if (!safeHref) {
                e.preventDefault();
              }
            }}
          >
            <ExternalLinkIcon />
          </a>
        </div>
      )}

      {/* 캡션 */}
      {(selected || caption) && (
        <div className="zm-bookmark-caption">
          {isEditingCaption ? (
            <input
              ref={captionInputRef}
              type="text"
              className="zm-bookmark-caption-input"
              value={captionValue}
              onChange={(e) => setCaptionValue(e.target.value)}
              onBlur={handleCaptionSave}
              onKeyDown={handleCaptionKeyDown}
              placeholder={locale.nodes.bookmark.addCaption}
            />
          ) : (
            <span className="zm-bookmark-caption-text" onClick={handleCaptionClick}>
              {caption || locale.nodes.bookmark.addCaption}
            </span>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

// Icons
function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

export default BookmarkNode;
