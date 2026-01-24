'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';

export type OpenAPINodeProps = NodeViewProps;

export type DisplayMode = 'swagger-ui' | 'redoc' | 'minimal';

/**
 * OpenAPINode - OpenAPI/Swagger 스펙 임베드 블록
 */
export function OpenAPINode({ node, updateAttributes, selected }: OpenAPINodeProps) {
  const locale = useLocale();
  const { specUrl = '', displayMode = 'swagger-ui' } = node.attrs;

  const [isEditing, setIsEditing] = useState(false);
  const [urlValue, setUrlValue] = useState(specUrl);
  const [modeValue, setModeValue] = useState<DisplayMode>(displayMode);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Initial edit mode
  useEffect(() => {
    if (!specUrl) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync values
  useEffect(() => {
    setUrlValue(specUrl);
    setModeValue(displayMode);
  }, [specUrl, displayMode]);

  // Focus on edit mode
  useEffect(() => {
    if (isEditing && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      specUrl: urlValue.trim(),
      displayMode: modeValue,
    });
    if (urlValue.trim()) {
      setIsEditing(false);
    }
  }, [urlValue, modeValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (specUrl) {
          setUrlValue(specUrl);
          setModeValue(displayMode);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, specUrl, displayMode]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const getIframeUrl = useCallback(() => {
    if (!specUrl) return '';

    const encodedUrl = encodeURIComponent(specUrl);

    switch (modeValue) {
      case 'swagger-ui':
        return `https://petstore.swagger.io/?url=${encodedUrl}`;
      case 'redoc':
        return `https://redocly.github.io/redoc/?url=${encodedUrl}`;
      case 'minimal':
      default:
        return specUrl;
    }
  }, [specUrl, modeValue]);

  // Edit mode
  if (isEditing || !specUrl) {
    return (
      <NodeViewWrapper className="zm-openapi-wrapper">
        <div
          className={`zm-openapi zm-openapi-editing ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-openapi-header">
            <OpenAPIIcon />
            <span className="zm-openapi-label">OpenAPI / Swagger</span>
          </div>

          {/* URL Input */}
          <div className="zm-openapi-input-group">
            <input
              ref={urlInputRef}
              type="text"
              className="zm-openapi-url-input"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={locale.nodes?.openapi?.urlPlaceholder || 'https://petstore.swagger.io/v2/swagger.json'}
            />
          </div>

          {/* Display mode selector */}
          <div className="zm-openapi-mode-selector">
            <label className="zm-openapi-mode-label">
              {locale.nodes?.openapi?.displayMode || 'Display Mode'}:
            </label>
            <div className="zm-openapi-mode-buttons">
              <button
                type="button"
                className={`zm-openapi-mode-btn ${modeValue === 'swagger-ui' ? 'is-active' : ''}`}
                onClick={() => setModeValue('swagger-ui')}
              >
                Swagger UI
              </button>
              <button
                type="button"
                className={`zm-openapi-mode-btn ${modeValue === 'redoc' ? 'is-active' : ''}`}
                onClick={() => setModeValue('redoc')}
              >
                ReDoc
              </button>
              <button
                type="button"
                className={`zm-openapi-mode-btn ${modeValue === 'minimal' ? 'is-active' : ''}`}
                onClick={() => setModeValue('minimal')}
              >
                {locale.nodes?.openapi?.minimal || 'Minimal'}
              </button>
            </div>
          </div>

          <div className="zm-openapi-hint">
            {locale.nodes?.openapi?.hint || 'Enter the URL to your OpenAPI/Swagger spec file'}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Display mode
  return (
    <NodeViewWrapper className="zm-openapi-wrapper">
      <div
        className={`zm-openapi zm-openapi-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
      >
        <div className="zm-openapi-header" onClick={handleEdit}>
          <OpenAPIIcon />
          <span className="zm-openapi-label">OpenAPI / Swagger</span>
          <span className="zm-openapi-mode-badge">{modeValue}</span>
        </div>

        {modeValue === 'minimal' ? (
          <div className="zm-openapi-minimal" onClick={handleEdit}>
            <div className="zm-openapi-url-display">
              <span className="zm-openapi-url-label">Spec URL:</span>
              <a
                href={specUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="zm-openapi-url-link"
                onClick={(e) => e.stopPropagation()}
              >
                {specUrl}
              </a>
            </div>
            <div className="zm-openapi-actions">
              <a
                href={`https://petstore.swagger.io/?url=${encodeURIComponent(specUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="zm-openapi-action-btn"
                onClick={(e) => e.stopPropagation()}
              >
                {locale.nodes?.openapi?.openInSwagger || 'Open in Swagger UI'}
              </a>
              <a
                href={`https://redocly.github.io/redoc/?url=${encodeURIComponent(specUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="zm-openapi-action-btn"
                onClick={(e) => e.stopPropagation()}
              >
                {locale.nodes?.openapi?.openInRedoc || 'Open in ReDoc'}
              </a>
            </div>
          </div>
        ) : (
          <div className="zm-openapi-iframe-container">
            <iframe
              src={getIframeUrl()}
              className="zm-openapi-iframe"
              title="OpenAPI Documentation"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        )}
      </div>

      {/* Toolbar on selection */}
      {selected && (
        <div className="zm-openapi-toolbar">
          <button
            type="button"
            className="zm-openapi-toolbar-btn"
            onClick={() => window.open(specUrl, '_blank')}
            title={locale.nodes?.openapi?.openSpec || 'Open Spec'}
          >
            <ExternalLinkIcon />
          </button>
          <button
            type="button"
            className="zm-openapi-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes?.openapi?.edit || 'Edit'}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function OpenAPIIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 1.5c5.799 0 10.5 4.701 10.5 10.5S17.799 22.5 12 22.5 1.5 17.799 1.5 12 6.201 1.5 12 1.5zm-.75 3v7.5h-6v1.5h7.5v-9h-1.5zm3 4.5v4.5h4.5v-1.5h-3V9h-1.5z"/>
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default OpenAPINode;
