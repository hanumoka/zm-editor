'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';

export type ErrorMessageNodeProps = NodeViewProps;

type MessageType = 'error' | 'warning' | 'info' | 'success';

const TYPE_STYLES: Record<MessageType, { bg: string; border: string; icon: string; title: string }> = {
  error: {
    bg: 'zm-error-msg-error',
    border: '#fca5a5',
    icon: '❌',
    title: 'Error',
  },
  warning: {
    bg: 'zm-error-msg-warning',
    border: '#fcd34d',
    icon: '⚠️',
    title: 'Warning',
  },
  info: {
    bg: 'zm-error-msg-info',
    border: '#93c5fd',
    icon: 'ℹ️',
    title: 'Info',
  },
  success: {
    bg: 'zm-error-msg-success',
    border: '#86efac',
    icon: '✅',
    title: 'Success',
  },
};

/**
 * ErrorMessageNode - 에러/경고/정보/성공 메시지 블록
 */
export function ErrorMessageNode({ node, updateAttributes, selected }: ErrorMessageNodeProps) {
  const locale = useLocale();
  const { title = '', message = '', type = 'error' } = node.attrs;
  const messageType = (type as MessageType) || 'error';
  const typeStyle = TYPE_STYLES[messageType];

  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [messageValue, setMessageValue] = useState(message);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // 초기 편집 상태
  useEffect(() => {
    if (!title && !message) {
      setIsEditing(true);
    }
  }, []);

  // 값 동기화
  useEffect(() => {
    setTitleValue(title);
    setMessageValue(message);
  }, [title, message]);

  // 편집 모드 시작 시 포커스
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      title: titleValue.trim(),
      message: messageValue.trim(),
    });
    if (titleValue.trim() || messageValue.trim()) {
      setIsEditing(false);
    }
  }, [titleValue, messageValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (title || message) {
          setTitleValue(title);
          setMessageValue(message);
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, title, message]
  );

  const handleTypeChange = useCallback(
    (newType: MessageType) => {
      updateAttributes({ type: newType });
    },
    [updateAttributes]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 편집 모드
  if (isEditing || (!title && !message)) {
    return (
      <NodeViewWrapper className="zm-error-msg-wrapper">
        <div
          className={`zm-error-msg zm-error-msg-editing ${typeStyle.bg} ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          {/* 타입 선택 */}
          <div className="zm-error-msg-type-selector">
            {(Object.keys(TYPE_STYLES) as MessageType[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`zm-error-msg-type-btn ${messageType === t ? 'is-active' : ''}`}
                onClick={() => handleTypeChange(t)}
                title={TYPE_STYLES[t].title}
              >
                <span>{TYPE_STYLES[t].icon}</span>
              </button>
            ))}
          </div>

          {/* 제목 입력 */}
          <div className="zm-error-msg-input-group">
            <input
              ref={titleInputRef}
              type="text"
              className="zm-error-msg-title-input"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={locale.nodes?.errorMessage?.titlePlaceholder || 'Error title (optional)'}
            />
          </div>

          {/* 메시지 입력 */}
          <div className="zm-error-msg-input-group">
            <textarea
              ref={messageInputRef}
              className="zm-error-msg-message-input"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={locale.nodes?.errorMessage?.messagePlaceholder || 'Error message or stack trace...'}
              rows={3}
            />
          </div>

          <div className="zm-error-msg-hint">
            {locale.nodes?.errorMessage?.hint || 'Ctrl+Enter to confirm, Escape to cancel'}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // 표시 모드
  return (
    <NodeViewWrapper className="zm-error-msg-wrapper">
      <div
        className={`zm-error-msg zm-error-msg-display ${typeStyle.bg} ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={handleEdit}
      >
        <div className="zm-error-msg-icon">
          <span>{typeStyle.icon}</span>
        </div>
        <div className="zm-error-msg-content">
          {title && <div className="zm-error-msg-title">{title}</div>}
          {message && <pre className="zm-error-msg-message">{message}</pre>}
        </div>
      </div>

      {/* 선택 시 툴바 */}
      {selected && (
        <div className="zm-error-msg-toolbar">
          {(Object.keys(TYPE_STYLES) as MessageType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`zm-error-msg-toolbar-btn ${messageType === t ? 'is-active' : ''}`}
              onClick={() => handleTypeChange(t)}
              title={TYPE_STYLES[t].title}
            >
              <span>{TYPE_STYLES[t].icon}</span>
            </button>
          ))}
          <button
            type="button"
            className="zm-error-msg-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes?.errorMessage?.edit || 'Edit'}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
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

export default ErrorMessageNode;
