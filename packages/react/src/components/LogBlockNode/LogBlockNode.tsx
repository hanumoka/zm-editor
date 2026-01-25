'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';

export type LogBlockNodeProps = NodeViewProps;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_STYLES: Record<LogLevel, { bg: string; icon: string; label: string }> = {
  debug: {
    bg: 'zm-log-debug',
    icon: '🔍',
    label: 'DEBUG',
  },
  info: {
    bg: 'zm-log-info',
    icon: 'ℹ️',
    label: 'INFO',
  },
  warn: {
    bg: 'zm-log-warn',
    icon: '⚠️',
    label: 'WARN',
  },
  error: {
    bg: 'zm-log-error',
    icon: '❌',
    label: 'ERROR',
  },
};

/**
 * LogBlockNode - 로그 메시지 블록
 */
export function LogBlockNode({ node, updateAttributes, selected }: LogBlockNodeProps) {
  const locale = useLocale();
  const { level = 'info', message = '', timestamp = '', source = '' } = node.attrs;
  const logLevel = (level as LogLevel) || 'info';
  const levelStyle = LEVEL_STYLES[logLevel];

  const [isEditing, setIsEditing] = useState(false);
  const [messageValue, setMessageValue] = useState(message);
  const [timestampValue, setTimestampValue] = useState(timestamp);
  const [sourceValue, setSourceValue] = useState(source);
  const [copied, setCopied] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
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
    if (!message) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync values
  useEffect(() => {
    setMessageValue(message);
    setTimestampValue(timestamp);
    setSourceValue(source);
  }, [message, timestamp, source]);

  // Focus on edit mode
  useEffect(() => {
    if (isEditing && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      message: messageValue.trim(),
      timestamp: timestampValue.trim(),
      source: sourceValue.trim(),
    });
    if (messageValue.trim()) {
      setIsEditing(false);
    }
  }, [messageValue, timestampValue, sourceValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (message) {
          setMessageValue(message);
          setTimestampValue(timestamp);
          setSourceValue(source);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, message, timestamp, source]
  );

  const handleLevelChange = useCallback(
    (newLevel: LogLevel) => {
      updateAttributes({ level: newLevel });
    },
    [updateAttributes]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCopy = useCallback(() => {
    const text = [
      timestamp ? `[${timestamp}]` : '',
      source ? `[${source}]` : '',
      `[${LEVEL_STYLES[logLevel].label}]`,
      message,
    ]
      .filter(Boolean)
      .join(' ');
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [timestamp, source, logLevel, message]);

  // Edit mode
  if (isEditing || !message) {
    return (
      <NodeViewWrapper className="zm-log-block-wrapper">
        <div
          className={`zm-log-block zm-log-block-editing ${levelStyle.bg} ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          {/* Level selector */}
          <div className="zm-log-level-selector">
            {(Object.keys(LEVEL_STYLES) as LogLevel[]).map((l) => (
              <button
                key={l}
                type="button"
                className={`zm-log-level-btn ${logLevel === l ? 'is-active' : ''}`}
                onClick={() => handleLevelChange(l)}
                title={LEVEL_STYLES[l].label}
              >
                <span>{LEVEL_STYLES[l].icon}</span>
                <span className="zm-log-level-label">{LEVEL_STYLES[l].label}</span>
              </button>
            ))}
          </div>

          {/* Metadata inputs */}
          <div className="zm-log-meta-inputs">
            <input
              type="text"
              className="zm-log-timestamp-input"
              value={timestampValue}
              onChange={(e) => setTimestampValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes?.logBlock?.timestampPlaceholder || '2024-01-24 12:34:56'}
            />
            <input
              type="text"
              className="zm-log-source-input"
              value={sourceValue}
              onChange={(e) => setSourceValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={locale.nodes?.logBlock?.sourcePlaceholder || 'Server'}
            />
          </div>

          {/* Message input */}
          <div className="zm-log-message-input-group">
            <textarea
              ref={messageInputRef}
              className="zm-log-message-input"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={locale.nodes?.logBlock?.messagePlaceholder || 'Log message...'}
              rows={2}
            />
          </div>

          <div className="zm-log-hint">
            {locale.nodes?.logBlock?.hint || 'Ctrl+Enter to confirm, Escape to cancel'}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Display mode
  return (
    <NodeViewWrapper className="zm-log-block-wrapper">
      <div
        className={`zm-log-block zm-log-block-display ${levelStyle.bg} ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={handleEdit}
      >
        <div className="zm-log-header">
          <span className="zm-log-icon">{levelStyle.icon}</span>
          <span className="zm-log-level-badge">{levelStyle.label}</span>
          {timestamp && <span className="zm-log-timestamp">{timestamp}</span>}
          {source && <span className="zm-log-source">[{source}]</span>}
        </div>
        <pre className="zm-log-message">{message}</pre>
      </div>

      {/* Toolbar on selection */}
      {selected && (
        <div className="zm-log-toolbar">
          {(Object.keys(LEVEL_STYLES) as LogLevel[]).map((l) => (
            <button
              key={l}
              type="button"
              className={`zm-log-toolbar-btn ${logLevel === l ? 'is-active' : ''}`}
              onClick={() => handleLevelChange(l)}
              title={LEVEL_STYLES[l].label}
            >
              <span>{LEVEL_STYLES[l].icon}</span>
            </button>
          ))}
          <button
            type="button"
            className="zm-log-toolbar-btn"
            onClick={handleCopy}
            title={locale.nodes?.logBlock?.copy || 'Copy'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          <button
            type="button"
            className="zm-log-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes?.logBlock?.edit || 'Edit'}
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

export default LogBlockNode;
