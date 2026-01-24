'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useLocale } from '../../context';

export type DiagramNodeProps = NodeViewProps;

export type DiagramType = 'plantuml' | 'd2';

// PlantUML encoding functions
function encodePlantUML(text: string): string {
  // PlantUML uses a special encoding: deflate + base64 with custom alphabet
  // For simplicity, we'll use the hex encoding method which PlantUML also supports
  return `~h${stringToHex(text)}`;
}

function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * DiagramNode - PlantUML / D2 다이어그램 블록
 */
export function DiagramNode({ node, updateAttributes, selected }: DiagramNodeProps) {
  const locale = useLocale();
  const { type = 'plantuml', code = '', theme = '' } = node.attrs;

  const [isEditing, setIsEditing] = useState(false);
  const [typeValue, setTypeValue] = useState<DiagramType>(type);
  const [codeValue, setCodeValue] = useState(code);
  const [themeValue, setThemeValue] = useState(theme);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const codeInputRef = useRef<HTMLTextAreaElement>(null);

  // Initial edit mode
  useEffect(() => {
    if (!code) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync values
  useEffect(() => {
    setTypeValue(type);
    setCodeValue(code);
    setThemeValue(theme);
  }, [type, code, theme]);

  // Focus on edit mode
  useEffect(() => {
    if (isEditing && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      type: typeValue,
      code: codeValue.trim(),
      theme: themeValue.trim(),
    });
    if (codeValue.trim()) {
      setIsEditing(false);
      setError(null);
    }
  }, [typeValue, codeValue, themeValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (code) {
          setTypeValue(type);
          setCodeValue(code);
          setThemeValue(theme);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, type, code, theme]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  // Generate image URL for PlantUML
  const imageUrl = useMemo(() => {
    if (!code || typeValue !== 'plantuml') return null;

    try {
      const encoded = encodePlantUML(code);
      return `https://www.plantuml.com/plantuml/svg/${encoded}`;
    } catch {
      return null;
    }
  }, [code, typeValue]);

  // Edit mode
  if (isEditing || !code) {
    return (
      <NodeViewWrapper className="zm-diagram-wrapper">
        <div
          className={`zm-diagram zm-diagram-editing ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-diagram-header">
            <DiagramIcon />
            <span className="zm-diagram-label">
              {typeValue === 'plantuml' ? 'PlantUML' : 'D2'} Diagram
            </span>
          </div>

          {/* Type selector */}
          <div className="zm-diagram-type-selector">
            <button
              type="button"
              className={`zm-diagram-type-btn ${typeValue === 'plantuml' ? 'is-active' : ''}`}
              onClick={() => setTypeValue('plantuml')}
            >
              PlantUML
            </button>
            <button
              type="button"
              className={`zm-diagram-type-btn ${typeValue === 'd2' ? 'is-active' : ''}`}
              onClick={() => setTypeValue('d2')}
            >
              D2
            </button>
          </div>

          {/* Code input */}
          <div className="zm-diagram-input-group">
            <textarea
              ref={codeInputRef}
              className="zm-diagram-code-input"
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={
                typeValue === 'plantuml'
                  ? locale.nodes?.diagram?.plantumlPlaceholder ||
                    '@startuml\nAlice -> Bob: Hello\nBob --> Alice: Hi!\n@enduml'
                  : locale.nodes?.diagram?.d2Placeholder ||
                    'direction: right\nA -> B -> C'
              }
              rows={10}
            />
          </div>

          {/* Theme (optional) */}
          <div className="zm-diagram-theme-group">
            <label className="zm-diagram-theme-label">
              {locale.nodes?.diagram?.theme || 'Theme (optional)'}:
            </label>
            <input
              type="text"
              className="zm-diagram-theme-input"
              value={themeValue}
              onChange={(e) => setThemeValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes?.diagram?.themePlaceholder || 'default'}
            />
          </div>

          {error && <div className="zm-diagram-error">{error}</div>}

          <div className="zm-diagram-hint">
            {typeValue === 'd2'
              ? locale.nodes?.diagram?.d2Hint ||
                'D2 requires server-side rendering. Preview may not be available.'
              : locale.nodes?.diagram?.hint || 'Ctrl+Enter to confirm, Escape to cancel'}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Display mode
  return (
    <NodeViewWrapper className="zm-diagram-wrapper">
      <div
        className={`zm-diagram zm-diagram-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
      >
        <div className="zm-diagram-header" onClick={handleEdit}>
          <DiagramIcon />
          <span className="zm-diagram-label">
            {typeValue === 'plantuml' ? 'PlantUML' : 'D2'} Diagram
          </span>
        </div>

        <div className="zm-diagram-preview" onClick={handleEdit}>
          {typeValue === 'plantuml' && imageUrl ? (
            <img
              src={imageUrl}
              alt="PlantUML Diagram"
              className="zm-diagram-image"
              onError={() => setError(locale.nodes?.diagram?.renderError || 'Failed to render diagram')}
            />
          ) : typeValue === 'd2' ? (
            <div className="zm-diagram-d2-preview">
              <pre className="zm-diagram-code-preview">{code}</pre>
              <div className="zm-diagram-d2-note">
                {locale.nodes?.diagram?.d2Note ||
                  'D2 diagrams require server-side rendering. Use kroki.io or d2-playground to render.'}
              </div>
              <a
                href={`https://play.d2lang.com/?script=${encodeURIComponent(code)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="zm-diagram-d2-link"
                onClick={(e) => e.stopPropagation()}
              >
                {locale.nodes?.diagram?.openInPlayground || 'Open in D2 Playground'}
              </a>
            </div>
          ) : (
            <pre className="zm-diagram-code-preview">{code}</pre>
          )}
        </div>

        {error && <div className="zm-diagram-error">{error}</div>}
      </div>

      {/* Toolbar on selection */}
      {selected && (
        <div className="zm-diagram-toolbar">
          <span className="zm-diagram-type-badge">{typeValue}</span>
          <button
            type="button"
            className="zm-diagram-toolbar-btn"
            onClick={handleCopy}
            title={locale.nodes?.diagram?.copy || 'Copy code'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <button
            type="button"
            className="zm-diagram-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes?.diagram?.edit || 'Edit'}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function DiagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="10" y1="6.5" x2="14" y2="6.5" />
      <line x1="17.5" y1="10" x2="17.5" y2="14" />
      <line x1="10" y1="17.5" x2="14" y2="17.5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
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

export default DiagramNode;
