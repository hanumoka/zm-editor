'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getFileIcon, formatFileSize, DownloadIcon } from './file-icons';
import { useLocale } from '../../context/LocaleContext';
import { isSafeImageUrl } from '@zm-editor/core';

export type FileAttachmentNodeProps = NodeViewProps;

/**
 * PDF.js types
 */
interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  destroy: () => void;
}

interface PDFPageProxy {
  getViewport: (options: { scale: number }) => PDFViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }) => {
    promise: Promise<void>;
  };
}

interface PDFViewport {
  width: number;
  height: number;
}

interface PDFJSModule {
  getDocument: (src: string | { url: string; withCredentials?: boolean }) => {
    promise: Promise<PDFDocumentProxy>;
  };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  version: string;
}

/**
 * 안전한 파일 URL 검증 (http, https, blob 허용)
 */
function isSafeFileUrl(url: string): boolean {
  if (!url) return false;
  // blob: URLs are always allowed for file attachments
  if (url.startsWith('blob:')) return true;
  // Relative URLs are allowed
  if (url.startsWith('/')) return true;
  // Use core security for http/https validation
  const result = isSafeImageUrl(url, { allowDataUrls: false, allowBlobUrls: true, blockPrivateIPs: false });
  return result.isValid;
}

/**
 * Check if file is a PDF
 */
function isPdfFile(mimeType: string, fileName: string): boolean {
  if (mimeType === 'application/pdf') return true;
  if (fileName && fileName.toLowerCase().endsWith('.pdf')) return true;
  return false;
}

/**
 * Load PDF.js dynamically
 */
async function loadPdfJs(): Promise<PDFJSModule | null> {
  try {
    const pdfjs = await import('pdfjs-dist') as unknown as PDFJSModule;
    // Set worker source from CDN
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    return pdfjs;
  } catch {
    console.warn('[FileAttachment] pdfjs-dist not installed. PDF preview is not available.');
    return null;
  }
}

/**
 * PDF Preview Icons
 */
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="zm-pdf-spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

/**
 * FileAttachmentNode - 파일 첨부 NodeView
 *
 * 파일 아이콘, 파일명, 크기, 다운로드 버튼을 표시하는 노드
 * PDF 파일의 경우 미리보기 기능 제공 (pdfjs-dist 설치 필요)
 */
export function FileAttachmentNode({ node, updateAttributes, selected }: FileAttachmentNodeProps) {
  const { url, fileName, fileSize, mimeType, caption = '' } = node.attrs;
  const locale = useLocale();

  // 캡션 편집 상태
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(caption);
  const captionInputRef = useRef<HTMLInputElement>(null);

  // PDF Preview state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfJsAvailable, setPdfJsAvailable] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // caption 속성이 변경되면 로컬 상태 동기화
  useEffect(() => {
    setCaptionValue(caption);
  }, [caption]);

  // Check if PDF.js is available on mount
  useEffect(() => {
    if (isPdfFile(mimeType, fileName)) {
      loadPdfJs().then((pdfjs) => {
        setPdfJsAvailable(pdfjs !== null);
      });
    }
  }, [mimeType, fileName]);

  // Load PDF document when preview is opened
  useEffect(() => {
    if (!showPdfPreview || !url || pdfDocument) return;

    let cancelled = false;

    async function loadPdf() {
      setPdfLoading(true);
      setPdfError(null);

      try {
        const pdfjs = await loadPdfJs();
        if (!pdfjs) {
          setPdfError(locale?.nodes?.fileAttachment?.pdfNotInstalled || 'PDF.js not installed');
          setPdfLoading(false);
          return;
        }

        if (cancelled) return;

        const loadingTask = pdfjs.getDocument(url);
        const doc = await loadingTask.promise;

        if (cancelled) {
          doc.destroy();
          return;
        }

        setPdfDocument(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('[FileAttachment] Failed to load PDF:', err);
        if (!cancelled) {
          setPdfError(locale?.nodes?.fileAttachment?.pdfError || 'Failed to load PDF');
        }
      } finally {
        if (!cancelled) {
          setPdfLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [showPdfPreview, url, pdfDocument, locale]);

  // Render current page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;

    let cancelled = false;

    async function renderPage() {
      if (!pdfDocument || !canvasRef.current || cancelled) return;

      try {
        const page = await pdfDocument.getPage(currentPage);
        if (cancelled) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Calculate scale to fit container (max width 600px)
        const maxWidth = 600;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(maxWidth / viewport.width, 2);
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;
      } catch (err) {
        console.error('[FileAttachment] Failed to render PDF page:', err);
      }
    }

    renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdfDocument, currentPage]);

  // Cleanup PDF document on unmount or when preview is closed
  useEffect(() => {
    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
    };
  }, [pdfDocument]);

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

  // PDF Preview toggle
  const handleTogglePdfPreview = useCallback(() => {
    if (showPdfPreview) {
      setShowPdfPreview(false);
      if (pdfDocument) {
        pdfDocument.destroy();
        setPdfDocument(null);
      }
      setCurrentPage(1);
      setTotalPages(0);
      setPdfError(null);
    } else {
      setShowPdfPreview(true);
    }
  }, [showPdfPreview, pdfDocument]);

  // Page navigation
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  // 파일 아이콘
  const fileIcon = getFileIcon(mimeType, fileName);

  // 파일 크기 포맷
  const fileSizeDisplay = formatFileSize(fileSize);

  // 파일명에서 확장자 추출
  const fileExtension = fileName?.split('.').pop()?.toUpperCase() || '';

  // Check if this is a PDF
  const isPdf = isPdfFile(mimeType, fileName);

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

        {/* PDF 미리보기 버튼 */}
        {isPdf && url && isSafeFileUrl(url) && pdfJsAvailable && (
          <button
            type="button"
            className={`zm-file-attachment-preview-btn ${showPdfPreview ? 'is-active' : ''}`}
            onClick={handleTogglePdfPreview}
            title={locale?.nodes?.fileAttachment?.pdfPreview || 'Preview PDF'}
          >
            <EyeIcon />
          </button>
        )}

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

      {/* PDF 미리보기 */}
      {isPdf && showPdfPreview && (
        <div className="zm-file-attachment-pdf-preview">
          {/* 닫기 버튼 */}
          <button
            type="button"
            className="zm-file-attachment-pdf-close"
            onClick={handleTogglePdfPreview}
            title={locale?.nodes?.fileAttachment?.pdfClose || 'Close preview'}
          >
            <CloseIcon />
          </button>

          {/* 로딩 상태 */}
          {pdfLoading && (
            <div className="zm-file-attachment-pdf-loading">
              <SpinnerIcon />
              <span>{locale?.nodes?.fileAttachment?.pdfLoading || 'Loading PDF...'}</span>
            </div>
          )}

          {/* 에러 상태 */}
          {pdfError && !pdfLoading && (
            <div className="zm-file-attachment-pdf-error">
              <span>{pdfError}</span>
            </div>
          )}

          {/* PDF 캔버스 */}
          {!pdfLoading && !pdfError && pdfDocument && (
            <>
              <div className="zm-file-attachment-pdf-canvas-container">
                <canvas ref={canvasRef} className="zm-file-attachment-pdf-canvas" />
              </div>

              {/* 페이지 컨트롤 */}
              {totalPages > 1 && (
                <div className="zm-file-attachment-pdf-controls">
                  <button
                    type="button"
                    className="zm-file-attachment-pdf-nav"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    title={locale?.nodes?.fileAttachment?.pdfPrevPage || 'Previous page'}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <span className="zm-file-attachment-pdf-page-info">
                    {locale?.nodes?.fileAttachment?.pdfPage || 'Page'} {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="zm-file-attachment-pdf-nav"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    title={locale?.nodes?.fileAttachment?.pdfNextPage || 'Next page'}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </>
          )}

          {/* PDF.js 미설치 안내 (pdfJsAvailable이 false인 경우) */}
          {!pdfLoading && !pdfError && !pdfDocument && pdfJsAvailable === false && (
            <div className="zm-file-attachment-pdf-not-installed">
              <span>{locale?.nodes?.fileAttachment?.pdfNotInstalled || 'PDF preview requires pdfjs-dist'}</span>
            </div>
          )}
        </div>
      )}

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
