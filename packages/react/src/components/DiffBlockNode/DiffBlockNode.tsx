'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useLocale } from '../../context';

// Icons
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

const DiffIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="8" y1="6" x2="8" y2="10" />
    <line x1="6" y1="8" x2="10" y2="8" />
    <line x1="14" y1="14" x2="18" y2="14" />
  </svg>
);

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

export interface DiffBlockNodeProps extends NodeViewProps {}

// Parse diff content to lines
function parseDiffContent(content: string): DiffLine[] {
  if (!content) return [];

  const lines = content.split('\n');
  return lines.map(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      return { type: 'added', content: line.slice(1) };
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      return { type: 'removed', content: line.slice(1) };
    } else if (line.startsWith(' ')) {
      return { type: 'unchanged', content: line.slice(1) };
    } else {
      return { type: 'unchanged', content: line };
    }
  });
}

export function DiffBlockNode({ node, updateAttributes, selected }: DiffBlockNodeProps) {
  const locale = useLocale();
  const t = locale.nodes.diffBlock;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const content = node.attrs.content || '';
  const filename = node.attrs.filename || '';
  const language = node.attrs.language || '';

  // Parse diff lines
  const diffLines = useMemo(() => parseDiffContent(content), [content]);

  // Statistics
  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffLines.forEach(line => {
      if (line.type === 'added') added++;
      else if (line.type === 'removed') removed++;
    });
    return { added, removed };
  }, [diffLines]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Focus textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Start editing
  const startEditing = useCallback(() => {
    setEditContent(content);
    setIsEditing(true);
  }, [content]);

  // Save changes
  const saveChanges = useCallback(() => {
    updateAttributes({ content: editContent });
    setIsEditing(false);
  }, [editContent, updateAttributes]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Copy content
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [content]);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelEditing();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveChanges();
    }
  }, [cancelEditing, saveChanges]);

  if (isEditing) {
    return (
      <NodeViewWrapper className="zm-diff-block-wrapper">
        <div className="zm-diff-block editing" data-selected={selected}>
          <div className="zm-diff-block-header">
            <div className="zm-diff-block-inputs">
              <input
                type="text"
                className="zm-diff-block-filename-input"
                value={filename}
                onChange={(e) => updateAttributes({ filename: e.target.value })}
                placeholder={t.filenamePlaceholder}
              />
              <input
                type="text"
                className="zm-diff-block-language-input"
                value={language}
                onChange={(e) => updateAttributes({ language: e.target.value })}
                placeholder={t.languagePlaceholder}
              />
            </div>
            <div className="zm-diff-block-actions">
              <button type="button" onClick={saveChanges} className="zm-diff-block-save-btn" title={t.save}>
                <CheckIcon />
              </button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            className="zm-diff-block-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            spellCheck={false}
          />
          <div className="zm-diff-block-hint">{t.hint}</div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="zm-diff-block-wrapper">
      <div className="zm-diff-block" data-selected={selected} onClick={startEditing}>
        <div className="zm-diff-block-header" contentEditable={false}>
          <div className="zm-diff-block-info">
            <DiffIcon />
            {filename && <span className="zm-diff-block-filename">{filename}</span>}
            {language && <span className="zm-diff-block-language">{language}</span>}
            <span className="zm-diff-block-stats">
              <span className="zm-diff-stats-added">+{stats.added}</span>
              <span className="zm-diff-stats-removed">-{stats.removed}</span>
            </span>
          </div>
          <div className="zm-diff-block-actions" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`zm-diff-block-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title={copied ? t.copied : t.copy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        {diffLines.length > 0 ? (
          <div className="zm-diff-block-content" contentEditable={false}>
            <div className="zm-diff-block-line-numbers">
              {diffLines.map((_, index) => (
                <span key={index} className="zm-diff-line-number">{index + 1}</span>
              ))}
            </div>
            <div className="zm-diff-block-lines">
              {diffLines.map((line, index) => (
                <div key={index} className={`zm-diff-line ${line.type}`}>
                  <span className="zm-diff-line-prefix">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="zm-diff-line-content">{line.content || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="zm-diff-block-empty" contentEditable={false}>
            {t.clickToEdit}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default DiffBlockNode;
