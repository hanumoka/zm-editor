'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import mermaid from 'mermaid';
import { useLocale } from '../../context';

export type MermaidNodeProps = NodeViewProps;

// Initialize mermaid with default config
let mermaidInitialized = false;

function initializeMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'strict',
    fontFamily: 'inherit',
  });
  mermaidInitialized = true;
}

/**
 * Mermaid 코드를 SVG로 렌더링
 */
async function renderMermaid(code: string, id: string): Promise<{ svg: string; error: string | null }> {
  if (!code.trim()) {
    return { svg: '', error: null };
  }

  initializeMermaid();

  try {
    const { svg } = await mermaid.render(id, code);
    return { svg, error: null };
  } catch (err) {
    // Mermaid render 실패 시 document.body에 orphan 에러 SVG가 생성됨
    // 이를 정리해야 함
    cleanupOrphanMermaidElements(id);

    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { svg: '', error: errorMessage };
  }
}

/**
 * Mermaid render 실패 시 생성되는 orphan SVG 요소들을 정리
 */
function cleanupOrphanMermaidElements(id: string) {
  if (typeof document === 'undefined') return;

  // ID로 생성된 요소 제거
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }

  // Mermaid 에러 컨테이너 제거 (d로 시작하는 임시 ID)
  const errorContainers = document.querySelectorAll('[id^="d"][id$="-svg"]');
  errorContainers.forEach((el) => {
    // body에 직접 붙어있는 mermaid 에러 SVG만 제거
    if (el.parentElement === document.body && el.classList.contains('mermaid')) {
      el.remove();
    }
  });

  // 일반적인 mermaid orphan SVG 제거 (body 직속 자식 중 mermaid 클래스)
  const orphanSvgs = document.querySelectorAll('body > svg.mermaid, body > [data-mermaid-temp]');
  orphanSvgs.forEach((el) => el.remove());
}

/**
 * MermaidNode - Mermaid.js를 이용한 다이어그램 NodeView
 */
export function MermaidNode({ node, updateAttributes, selected }: MermaidNodeProps) {
  const locale = useLocale();
  const { code = '' } = node.attrs;

  // 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [codeValue, setCodeValue] = useState(code);
  const [renderedSvg, setRenderedSvg] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const renderIdRef = useRef(0);

  // 클라이언트 마운트 후 초기 편집 상태 설정
  useEffect(() => {
    if (!code) {
      setIsEditing(true);
    }
  }, []);

  // 코드 동기화
  useEffect(() => {
    setCodeValue(code);
  }, [code]);

  // Mermaid 렌더링
  useEffect(() => {
    if (!codeValue.trim()) {
      setRenderedSvg('');
      setRenderError(null);
      return;
    }

    const currentRender = ++renderIdRef.current;
    setIsRendering(true);

    const timeoutId = setTimeout(async () => {
      const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const result = await renderMermaid(codeValue, uniqueId);

      // Only update if this is still the latest render request
      if (currentRender === renderIdRef.current) {
        setRenderedSvg(result.svg);
        setRenderError(result.error);
        setIsRendering(false);
      }
    }, 300); // Debounce rendering

    return () => clearTimeout(timeoutId);
  }, [codeValue]);

  // 저장
  const handleSave = useCallback(() => {
    const trimmed = codeValue.trim();
    updateAttributes({ code: trimmed });
    if (trimmed) {
      setIsEditing(false);
    }
  }, [codeValue, updateAttributes]);

  // 키 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        if (code) {
          setCodeValue(code);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, code]
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [codeValue, adjustTextareaHeight]);

  // 편집 모드
  if (isEditing || !code) {
    return (
      <NodeViewWrapper className="zm-mermaid-node-wrapper">
        <div
          className={`zm-mermaid-node zm-mermaid-input-mode ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-mermaid-input-container">
            <div className="zm-mermaid-input-header">
              <MermaidIcon />
              <span className="zm-mermaid-input-label">{locale.nodes.mermaid?.label || 'Mermaid Diagram'}</span>
            </div>
            <textarea
              ref={textareaRef}
              className="zm-mermaid-code-input"
              value={codeValue}
              onChange={(e) => {
                setCodeValue(e.target.value);
                adjustTextareaHeight();
              }}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes.mermaid?.placeholder || 'Enter Mermaid diagram code...'}
              spellCheck={false}
            />
            {/* 실시간 미리보기 */}
            {codeValue.trim() && (
              <div className="zm-mermaid-preview">
                {isRendering ? (
                  <div className="zm-mermaid-loading">
                    <LoadingSpinner />
                    <span>Rendering...</span>
                  </div>
                ) : renderError ? (
                  <div className="zm-mermaid-error">{renderError}</div>
                ) : renderedSvg ? (
                  <div
                    className="zm-mermaid-rendered"
                    dangerouslySetInnerHTML={{ __html: renderedSvg }}
                  />
                ) : null}
              </div>
            )}
            <div className="zm-mermaid-hint">{locale.nodes.mermaid?.hint || 'Press Ctrl+Enter to confirm, Escape to cancel'}</div>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // 디스플레이 모드
  return (
    <NodeViewWrapper className="zm-mermaid-node-wrapper">
      <div
        className={`zm-mermaid-node zm-mermaid-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={handleEdit}
      >
        {renderError ? (
          <div className="zm-mermaid-error-display">
            <div className="zm-mermaid-error-icon">
              <ErrorIcon />
            </div>
            <div className="zm-mermaid-error-message">{renderError}</div>
            <div className="zm-mermaid-error-source">{code}</div>
          </div>
        ) : renderedSvg ? (
          <div
            className="zm-mermaid-rendered"
            dangerouslySetInnerHTML={{ __html: renderedSvg }}
          />
        ) : (
          <div className="zm-mermaid-loading">
            <LoadingSpinner />
            <span>Rendering diagram...</span>
          </div>
        )}
      </div>

      {/* 선택 시 툴바 */}
      {selected && (
        <div className="zm-mermaid-toolbar">
          <button
            type="button"
            className="zm-mermaid-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes.mermaid?.edit || 'Edit diagram'}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// Icons
function MermaidIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
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

function LoadingSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="zm-mermaid-spinner">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

export default MermaidNode;
