'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';

export type MathNodeProps = NodeViewProps;

// KaTeX module reference (loaded dynamically)
let katexModule: typeof import('katex') | null = null;
let katexLoadError: string | null = null;

/**
 * Dynamically load katex library
 */
async function loadKatex(): Promise<typeof import('katex') | null> {
  if (katexModule) return katexModule;
  if (katexLoadError) return null;

  try {
    katexModule = await import('katex');
    return katexModule;
  } catch (err) {
    katexLoadError = 'KaTeX library is not installed. Please run: npm install katex';
    console.warn('[zm-editor] KaTeX not available:', katexLoadError);
    return null;
  }
}

/**
 * LaTeX를 HTML로 렌더링
 */
async function renderLatexAsync(
  latex: string,
  displayMode: boolean
): Promise<{ html: string; error: string | null }> {
  if (!latex.trim()) {
    return { html: '', error: null };
  }

  const katex = await loadKatex();
  if (!katex) {
    return { html: '', error: katexLoadError || 'KaTeX library not available' };
  }

  try {
    const html = katex.default.renderToString(latex, {
      displayMode,
      throwOnError: true,
      strict: false,
      trust: false,
      output: 'html',
    });
    return { html, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { html: '', error: errorMessage };
  }
}

/**
 * MathNode - KaTeX를 이용한 수학 수식 NodeView
 */
export function MathNode({ node, updateAttributes, selected }: MathNodeProps) {
  const locale = useLocale();
  const { latex = '', displayMode = true } = node.attrs;

  // 편집 상태 (hydration 불일치 방지를 위해 초기값 false)
  const [isEditing, setIsEditing] = useState(false);
  const [latexValue, setLatexValue] = useState(latex);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isKatexAvailable, setIsKatexAvailable] = useState<boolean | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check if katex is available on mount
  useEffect(() => {
    loadKatex().then((k) => setIsKatexAvailable(k !== null));
  }, []);

  // 클라이언트 마운트 후 초기 편집 상태 설정
  useEffect(() => {
    if (!latex) {
      setIsEditing(true);
    }
  }, []);

  // LaTeX 동기화
  useEffect(() => {
    setLatexValue(latex);
    if (latex) {
      setIsEditing(false);
    }
  }, [latex]);

  // Render latex when latexValue changes
  useEffect(() => {
    if (!latexValue.trim()) {
      setRenderedHtml('');
      setRenderError(null);
      return;
    }

    renderLatexAsync(latexValue, displayMode).then((result) => {
      setRenderedHtml(result.html);
      setRenderError(result.error);
    });
  }, [latexValue, displayMode]);

  // 저장
  const handleSave = useCallback(() => {
    const trimmed = latexValue.trim();
    if (!trimmed) {
      return;
    }

    updateAttributes({ latex: trimmed });
    setIsEditing(false);
  }, [latexValue, updateAttributes]);

  // 키 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        if (latex) {
          setLatexValue(latex);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, latex]
  );

  // 편집 모드 시작
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  // 포커스 처리
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // textarea 자동 높이 조절
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [latexValue, adjustTextareaHeight]);

  // KaTeX not available - show installation message
  if (isKatexAvailable === false) {
    return (
      <NodeViewWrapper className="zm-math-node-wrapper">
        <div className={`zm-math-node zm-math-unavailable ${selected ? 'is-selected' : ''}`}>
          <div className="zm-math-unavailable-content">
            <MathIcon />
            <div className="zm-math-unavailable-title">Math Equations</div>
            <div className="zm-math-unavailable-message">
              To use math equations, please install the KaTeX package:
            </div>
            <code className="zm-math-unavailable-code">npm install katex</code>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // 편집 모드
  if (isEditing || !latex) {
    return (
      <NodeViewWrapper className="zm-math-node-wrapper">
        <div
          className={`zm-math-node zm-math-input-mode ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-math-input-container">
            <div className="zm-math-input-header">
              <MathIcon />
              <span className="zm-math-input-label">{locale.nodes.math.label}</span>
            </div>
            <textarea
              ref={textareaRef}
              className="zm-math-latex-input"
              value={latexValue}
              onChange={(e) => {
                setLatexValue(e.target.value);
                adjustTextareaHeight();
              }}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes.math.placeholder}
              spellCheck={false}
            />
            {/* 실시간 미리보기 */}
            {latexValue.trim() && (
              <div className="zm-math-preview">
                {renderError ? (
                  <div className="zm-math-error">{renderError}</div>
                ) : renderedHtml ? (
                  <div
                    className="zm-math-rendered"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                ) : null}
              </div>
            )}
            <div className="zm-math-hint">{locale.nodes.math.hint}</div>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // 렌더링 결과 (display mode)
  return (
    <NodeViewWrapper className="zm-math-node-wrapper">
      <div
        className={`zm-math-node zm-math-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={handleEdit}
      >
        {renderError ? (
          <div className="zm-math-error-display">
            <div className="zm-math-error-icon">
              <ErrorIcon />
            </div>
            <div className="zm-math-error-message">{renderError}</div>
            <div className="zm-math-error-source">{latex}</div>
          </div>
        ) : renderedHtml ? (
          <div
            className="zm-math-rendered"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : (
          <div className="zm-math-loading">Loading...</div>
        )}
      </div>

      {/* 선택 시 툴바 */}
      {selected && (
        <div className="zm-math-toolbar">
          <button
            type="button"
            className="zm-math-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes.math.edit}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// Icons
function MathIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20h4l4-12 4 12h4" />
      <path d="M4 4h16" />
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

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default MathNode;
