'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';

export type StackTraceNodeProps = NodeViewProps;

export type StackTraceLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'rust' | 'csharp' | 'ruby' | 'php' | 'other';

const LANGUAGE_OPTIONS: { value: StackTraceLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'other', label: 'Other' },
];

/**
 * StackTraceNode - 스택 트레이스 블록
 */
export function StackTraceNode({ node, updateAttributes, selected }: StackTraceNodeProps) {
  const locale = useLocale();
  const { language = 'javascript', errorType = '', errorMessage = '', stackTrace = '' } = node.attrs;

  const [isEditing, setIsEditing] = useState(false);
  const [languageValue, setLanguageValue] = useState(language);
  const [errorTypeValue, setErrorTypeValue] = useState(errorType);
  const [errorMessageValue, setErrorMessageValue] = useState(errorMessage);
  const [stackTraceValue, setStackTraceValue] = useState(stackTrace);
  const [copied, setCopied] = useState(false);
  const errorTypeInputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Initial edit mode
  useEffect(() => {
    if (!errorMessage && !stackTrace) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync values
  useEffect(() => {
    setLanguageValue(language);
    setErrorTypeValue(errorType);
    setErrorMessageValue(errorMessage);
    setStackTraceValue(stackTrace);
  }, [language, errorType, errorMessage, stackTrace]);

  // Focus on edit mode
  useEffect(() => {
    if (isEditing && errorTypeInputRef.current) {
      errorTypeInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      language: languageValue,
      errorType: errorTypeValue.trim(),
      errorMessage: errorMessageValue.trim(),
      stackTrace: stackTraceValue.trim(),
    });
    if (errorMessageValue.trim() || stackTraceValue.trim()) {
      setIsEditing(false);
    }
  }, [languageValue, errorTypeValue, errorMessageValue, stackTraceValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (errorMessage || stackTrace) {
          setErrorTypeValue(errorType);
          setErrorMessageValue(errorMessage);
          setStackTraceValue(stackTrace);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, errorType, errorMessage, stackTrace]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCopy = useCallback(() => {
    const text = [errorType, errorMessage, '', stackTrace].filter(Boolean).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [errorType, errorMessage, stackTrace]);

  // Parse stack trace for highlighting
  const parseStackTrace = useCallback((trace: string) => {
    return trace.split('\n').map((line, index) => {
      // Highlight file paths and line numbers
      const filePathMatch = line.match(/(?:at\s+)?(.+?):(\d+)(?::(\d+))?/);
      if (filePathMatch) {
        return (
          <div key={index} className="zm-stack-trace-line">
            <span className="zm-stack-trace-line-num">{index + 1}</span>
            <span className="zm-stack-trace-line-content">
              {line.substring(0, filePathMatch.index)}
              <span className="zm-stack-trace-file">{filePathMatch[1]}</span>
              <span className="zm-stack-trace-location">
                :{filePathMatch[2]}
                {filePathMatch[3] && `:${filePathMatch[3]}`}
              </span>
              {line.substring((filePathMatch.index || 0) + filePathMatch[0].length)}
            </span>
          </div>
        );
      }
      return (
        <div key={index} className="zm-stack-trace-line">
          <span className="zm-stack-trace-line-num">{index + 1}</span>
          <span className="zm-stack-trace-line-content">{line}</span>
        </div>
      );
    });
  }, []);

  // Edit mode
  if (isEditing || (!errorMessage && !stackTrace)) {
    return (
      <NodeViewWrapper className="zm-stack-trace-wrapper">
        <div
          className={`zm-stack-trace zm-stack-trace-editing ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          {/* Language selector */}
          <div className="zm-stack-trace-header-edit">
            <select
              className="zm-stack-trace-language-select"
              value={languageValue}
              onChange={(e) => setLanguageValue(e.target.value as StackTraceLanguage)}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error type and message */}
          <div className="zm-stack-trace-error-inputs">
            <input
              ref={errorTypeInputRef}
              type="text"
              className="zm-stack-trace-error-type-input"
              value={errorTypeValue}
              onChange={(e) => setErrorTypeValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes?.stackTrace?.errorTypePlaceholder || 'TypeError'}
            />
            <input
              type="text"
              className="zm-stack-trace-error-message-input"
              value={errorMessageValue}
              onChange={(e) => setErrorMessageValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes?.stackTrace?.errorMessagePlaceholder || "Cannot read property 'x' of undefined"}
            />
          </div>

          {/* Stack trace input */}
          <div className="zm-stack-trace-input-group">
            <textarea
              className="zm-stack-trace-input"
              value={stackTraceValue}
              onChange={(e) => setStackTraceValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={locale.nodes?.stackTrace?.stackPlaceholder || 'Paste stack trace here...'}
              rows={8}
            />
          </div>

          <div className="zm-stack-trace-hint">
            {locale.nodes?.stackTrace?.hint || 'Ctrl+Enter to confirm, Escape to cancel'}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Display mode
  return (
    <NodeViewWrapper className="zm-stack-trace-wrapper">
      <div
        className={`zm-stack-trace zm-stack-trace-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
      >
        {/* Error header */}
        {(errorType || errorMessage) && (
          <div className="zm-stack-trace-error-header" onClick={handleEdit}>
            {errorType && <span className="zm-stack-trace-error-type">{errorType}</span>}
            {errorType && errorMessage && <span className="zm-stack-trace-error-separator">:</span>}
            {errorMessage && <span className="zm-stack-trace-error-message">{errorMessage}</span>}
          </div>
        )}

        {/* Stack trace body */}
        {stackTrace && (
          <div className="zm-stack-trace-body" onClick={handleEdit}>
            {parseStackTrace(stackTrace)}
          </div>
        )}
      </div>

      {/* Toolbar on selection */}
      {selected && (
        <div className="zm-stack-trace-toolbar">
          <span className="zm-stack-trace-language-badge">{language}</span>
          <button
            type="button"
            className="zm-stack-trace-toolbar-btn"
            onClick={handleCopy}
            title={locale.nodes?.stackTrace?.copy || 'Copy'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <button
            type="button"
            className="zm-stack-trace-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes?.stackTrace?.edit || 'Edit'}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
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

export default StackTraceNode;
