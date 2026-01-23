'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getFileIcon, formatFileSize, DownloadIcon } from './file-icons';
import { useLocale } from '../../context/LocaleContext';
import { isSafeImageUrl } from '@zm-editor/core';

export type FileAttachmentNodeProps = NodeViewProps;

/**
 * 안전한 파일 URL 검증 (http, https, blob 허용)
 */
function isSafeFileUrl(url: string): boolean {
  if (!url) return false;
  // blob: URLs are always allowed for file attachments
  if (url.startsWith('blob:')) return true;
  // Use core security for http/https validation
  const result = isSafeImageUrl(url, { allowDataUrls: false, allowBlobUrls: true, blockPrivateIPs: false });
  return result.isValid;
}

/**
 * FileAttachmentNode - 파일 첨부 NodeView
 *
 * 파일 아이콘, 파일명, 크기, 다운로드 버튼을 표시하는 노드
 */
export function FileAttachmentNode({ node, updateAttributes, selected }: FileAttachmentNodeProps) {
  const { url, fileName, fileSize, mimeType, caption = '' } = node.attrs;
  const locale = useLocale();

  // 캡션 편집 상태
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(caption);
  const captionInputRef = useRef<HTMLInputElement>(null);

  // caption 속성이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setCaptionValue(caption);
  }, [caption]);

  // 다운로드 핸들러
  const handleDownload = useCallback(() => {
    if (!isSafeFileUrl(url)) {
      console.warn('[FileAttachment] Invalid URL:', url);
      return;
    }

    // 새 탭에서 다운로드 링크 열기
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [url, fileName]);

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

  // 파일 아이콘
  const fileIcon = getFileIcon(mimeType, fileName);

  // 파일 크기 포맷
  const fileSizeDisplay = formatFileSize(fileSize);

  // 파일명에서 확장자 추출
  const fileExtension = fileName?.split('.').pop()?.toUpperCase() || '';

  return (
    <NodeViewWrapper className="zm-file-attachment-wrapper">
      <div
        className={`zm-file-attachment ${selected ? 'is-selected' : ''}`}
        data-drag-handle
      >
        {/* 파일 아이콘 */}
        <div className="zm-file-attachment-icon">
          {fileIcon}
        </div>

        {/* 파일 정보 */}
        <div className="zm-file-attachment-info">
          <div className="zm-file-attachment-name" title={fileName}>
            {fileName || 'Unknown file'}
          </div>
          <div className="zm-file-attachment-meta">
            {fileExtension && <span className="zm-file-attachment-type">{fileExtension}</span>}
            {fileSize > 0 && <span className="zm-file-attachment-size">{fileSizeDisplay}</span>}
          </div>
        </div>

        {/* 다운로드 버튼 */}
        {url && isSafeFileUrl(url) && (
          <button
            type="button"
            className="zm-file-attachment-download"
            onClick={handleDownload}
            title={locale?.nodes?.fileAttachment?.download || 'Download'}
          >
            <DownloadIcon />
          </button>
        )}
      </div>

      {/* 캡션 (선택 시 또는 캡션이 있을 때 표시) */}
      {(selected || caption) && (
        <div className="zm-file-attachment-caption">
          {isEditingCaption ? (
            <input
              ref={captionInputRef}
              type="text"
              className="zm-file-attachment-caption-input"
              value={captionValue}
              onChange={(e) => setCaptionValue(e.target.value)}
              onBlur={handleCaptionSave}
              onKeyDown={handleCaptionKeyDown}
              placeholder={locale?.nodes?.fileAttachment?.addCaption || 'Add a caption...'}
            />
          ) : (
            <span
              className="zm-file-attachment-caption-text"
              onClick={handleCaptionClick}
            >
              {caption || (locale?.nodes?.fileAttachment?.addCaption || 'Add a caption...')}
            </span>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export default FileAttachmentNode;
