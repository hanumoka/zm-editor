import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import katex from 'katex';
import { useLocale } from '../../context';

export type MathNodeProps = NodeViewProps;

/**
 * LaTeX를 HTML로 렌더링
 */
function renderLatex(latex: string, displayMode: boolean): { html: string; error: string | null } {
  if (!latex.trim()) {
    return { html: '', error: null };
  }

  try {
    const html = katex.renderToString(latex, {
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
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 마운트 후 초기 편집 상태 설정
  useEffect(() => {
    setIsMounted(true);
    if (!latex) {
      setIsEditing(true);
    }
  }, []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // LaTeX 렌더링 결과
  const rendered = useMemo(() => renderLatex(latexValue, displayMode), [latexValue, displayMode]);

  // LaTeX 동기화
  useEffect(() => {
    setLatexValue(latex);
    if (latex) {
      setIsEditing(false);
    }
  }, [latex]);

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
                {rendered.error ? (
                  <div className="zm-math-error">{rendered.error}</div>
                ) : (
                  <div
                    className="zm-math-rendered"
                    dangerouslySetInnerHTML={{ __html: rendered.html }}
                  />
                )}
              </div>
            )}
            <div className="zm-math-hint">{locale.nodes.math.hint}</div>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // 렌더링 결과
  const finalRendered = renderLatex(latex, displayMode);

  return (
    <NodeViewWrapper className="zm-math-node-wrapper">
      <div
        className={`zm-math-node zm-math-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={handleEdit}
      >
        {finalRendered.error ? (
          <div className="zm-math-error-display">
            <div className="zm-math-error-icon">
              <ErrorIcon />
            </div>
            <div className="zm-math-error-message">{finalRendered.error}</div>
            <div className="zm-math-error-source">{latex}</div>
          </div>
        ) : (
          <div
            className="zm-math-rendered"
            dangerouslySetInnerHTML={{ __html: finalRendered.html }}
          />
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
