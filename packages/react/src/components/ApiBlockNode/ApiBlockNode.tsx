'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { HttpMethod } from './api-block-extension';

export type ApiBlockNodeProps = NodeViewProps;

// HTTP 메서드별 색상
const METHOD_COLORS: Record<HttpMethod, { bg: string; text: string }> = {
  GET: { bg: '#dbeafe', text: '#1d4ed8' },
  POST: { bg: '#dcfce7', text: '#15803d' },
  PUT: { bg: '#fef3c7', text: '#b45309' },
  PATCH: { bg: '#fef9c3', text: '#a16207' },
  DELETE: { bg: '#fee2e2', text: '#dc2626' },
};

// HTTP 상태 코드별 색상
const getStatusColor = (code: number): { bg: string; text: string } => {
  if (code >= 200 && code < 300) return { bg: '#dcfce7', text: '#15803d' };
  if (code >= 300 && code < 400) return { bg: '#dbeafe', text: '#1d4ed8' };
  if (code >= 400 && code < 500) return { bg: '#fef3c7', text: '#b45309' };
  if (code >= 500) return { bg: '#fee2e2', text: '#dc2626' };
  return { bg: '#f3f4f6', text: '#374151' };
};

// 아이콘 컴포넌트들
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/**
 * ApiBlockNode - API Request/Response 블록 NodeView
 *
 * HTTP 요청과 응답을 문서화합니다.
 */
export function ApiBlockNode({ node, updateAttributes, selected }: ApiBlockNodeProps) {
  const {
    method = 'GET',
    url = '',
    requestBody = '',
    responseBody = '',
    statusCode = 200,
  } = node.attrs;
  const locale = useLocale();
  const t = locale.nodes.apiBlock;

  const [copiedRequest, setCopiedRequest] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [showRequest, setShowRequest] = useState(!!requestBody);
  const [showResponse, setShowResponse] = useState(!!responseBody);

  const copyRequestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copyResponseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (copyRequestTimeoutRef.current) {
        clearTimeout(copyRequestTimeoutRef.current);
      }
      if (copyResponseTimeoutRef.current) {
        clearTimeout(copyResponseTimeoutRef.current);
      }
    };
  }, []);

  // 요청 복사
  const handleCopyRequest = useCallback(async () => {
    if (!requestBody) return;

    try {
      await navigator.clipboard.writeText(requestBody);
      setCopiedRequest(true);

      if (copyRequestTimeoutRef.current) {
        clearTimeout(copyRequestTimeoutRef.current);
      }
      copyRequestTimeoutRef.current = setTimeout(() => setCopiedRequest(false), 2000);
    } catch (err) {
      console.error('Failed to copy request:', err);
    }
  }, [requestBody]);

  // 응답 복사
  const handleCopyResponse = useCallback(async () => {
    if (!responseBody) return;

    try {
      await navigator.clipboard.writeText(responseBody);
      setCopiedResponse(true);

      if (copyResponseTimeoutRef.current) {
        clearTimeout(copyResponseTimeoutRef.current);
      }
      copyResponseTimeoutRef.current = setTimeout(() => setCopiedResponse(false), 2000);
    } catch (err) {
      console.error('Failed to copy response:', err);
    }
  }, [responseBody]);

  // 메서드 변경
  const handleMethodChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateAttributes({ method: e.target.value });
    },
    [updateAttributes]
  );

  // URL 변경
  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateAttributes({ url: e.target.value });
    },
    [updateAttributes]
  );

  // 요청 본문 변경
  const handleRequestBodyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateAttributes({ requestBody: e.target.value });
      // 높이 자동 조절
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    },
    [updateAttributes]
  );

  // 응답 본문 변경
  const handleResponseBodyChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateAttributes({ responseBody: e.target.value });
      // 높이 자동 조절
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    },
    [updateAttributes]
  );

  // 상태 코드 변경
  const handleStatusCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const code = parseInt(e.target.value, 10);
      if (!isNaN(code) && code >= 100 && code < 600) {
        updateAttributes({ statusCode: code });
      }
    },
    [updateAttributes]
  );

  const methodColor = METHOD_COLORS[method as HttpMethod] || METHOD_COLORS.GET;
  const statusColor = getStatusColor(statusCode);

  return (
    <NodeViewWrapper className="zm-api-block-node-wrapper">
      <div className={`zm-api-block-node ${selected ? 'is-selected' : ''}`}>
        {/* 요청 헤더 */}
        <div className="zm-api-block-header">
          <div className="zm-api-block-method-url">
            <select
              className="zm-api-block-method-select"
              value={method}
              onChange={handleMethodChange}
              style={{ backgroundColor: methodColor.bg, color: methodColor.text }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              className="zm-api-block-url-input"
              value={url}
              onChange={handleUrlChange}
              placeholder={t.urlPlaceholder}
              spellCheck={false}
            />
          </div>
        </div>

        {/* 요청 본문 섹션 */}
        <div className="zm-api-block-section">
          <button
            type="button"
            className="zm-api-block-section-header"
            onClick={() => setShowRequest(!showRequest)}
          >
            <ChevronIcon open={showRequest} />
            <span>{t.requestBody}</span>
            {requestBody && (
              <button
                type="button"
                className={`zm-api-block-copy-btn ${copiedRequest ? 'copied' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyRequest();
                }}
                title={copiedRequest ? t.copied : t.copy}
              >
                {copiedRequest ? <CheckIcon /> : <CopyIcon />}
              </button>
            )}
          </button>
          {showRequest && (
            <div className="zm-api-block-section-content">
              <textarea
                className="zm-api-block-textarea"
                value={requestBody}
                onChange={handleRequestBodyChange}
                placeholder={t.requestPlaceholder}
                spellCheck={false}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* 응답 본문 섹션 */}
        <div className="zm-api-block-section">
          <button
            type="button"
            className="zm-api-block-section-header"
            onClick={() => setShowResponse(!showResponse)}
          >
            <ChevronIcon open={showResponse} />
            <span>{t.responseBody}</span>
            <div className="zm-api-block-status">
              <input
                type="number"
                className="zm-api-block-status-input"
                value={statusCode}
                onChange={handleStatusCodeChange}
                min={100}
                max={599}
                onClick={(e) => e.stopPropagation()}
                style={{ backgroundColor: statusColor.bg, color: statusColor.text }}
              />
            </div>
            {responseBody && (
              <button
                type="button"
                className={`zm-api-block-copy-btn ${copiedResponse ? 'copied' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyResponse();
                }}
                title={copiedResponse ? t.copied : t.copy}
              >
                {copiedResponse ? <CheckIcon /> : <CopyIcon />}
              </button>
            )}
          </button>
          {showResponse && (
            <div className="zm-api-block-section-content">
              <textarea
                className="zm-api-block-textarea"
                value={responseBody}
                onChange={handleResponseBodyChange}
                placeholder={t.responsePlaceholder}
                spellCheck={false}
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default ApiBlockNode;
