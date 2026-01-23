'use client';

import { useState, useCallback, useRef } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useLocale } from '../../context';

// Icons
const FootnoteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="16" y2="11" />
    <line x1="8" y1="15" x2="12" y2="15" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export interface FootnoteItem {
  id: string;
  content: string;
}

export interface FootnoteNodeProps extends NodeViewProps {}

export function FootnoteNode({ node, updateAttributes, selected }: FootnoteNodeProps) {
  const locale = useLocale();
  const t = locale.nodes.footnote;

  const [isEditing, setIsEditing] = useState(false);
  const [editingFootnotes, setEditingFootnotes] = useState<FootnoteItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const footnotes: FootnoteItem[] = node.attrs.footnotes || [];

  // Start editing
  const startEditing = useCallback(() => {
    setEditingFootnotes(footnotes.length > 0 ? [...footnotes] : [{ id: '1', content: '' }]);
    setIsEditing(true);
  }, [footnotes]);

  // Save changes
  const saveChanges = useCallback(() => {
    const validFootnotes = editingFootnotes.filter(f => f.content.trim() !== '');
    // Re-number footnotes
    const numberedFootnotes = validFootnotes.map((f, index) => ({
      ...f,
      id: String(index + 1),
    }));
    updateAttributes({ footnotes: numberedFootnotes });
    setIsEditing(false);
  }, [editingFootnotes, updateAttributes]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Add footnote
  const addFootnote = useCallback(() => {
    setEditingFootnotes(prev => [
      ...prev,
      { id: String(prev.length + 1), content: '' }
    ]);
  }, []);

  // Remove footnote
  const removeFootnote = useCallback((index: number) => {
    setEditingFootnotes(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Re-number
      return updated.map((f, i) => ({ ...f, id: String(i + 1) }));
    });
  }, []);

  // Update footnote content
  const updateFootnote = useCallback((index: number, content: string) => {
    setEditingFootnotes(prev => prev.map((f, i) =>
      i === index ? { ...f, content } : f
    ));
  }, []);

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
      <NodeViewWrapper className="zm-footnote-wrapper">
        <div
          className="zm-footnote editing"
          data-selected={selected}
          onKeyDown={handleKeyDown}
          ref={containerRef}
        >
          <div className="zm-footnote-header">
            <div className="zm-footnote-title">
              <FootnoteIcon />
              <span>{t.title}</span>
            </div>
            <div className="zm-footnote-actions">
              <button type="button" onClick={saveChanges} className="zm-footnote-save-btn" title={t.save}>
                <CheckIcon />
              </button>
            </div>
          </div>

          <div className="zm-footnote-list">
            {editingFootnotes.map((footnote, index) => (
              <div key={index} className="zm-footnote-item editing">
                <span className="zm-footnote-number">[{index + 1}]</span>
                <input
                  type="text"
                  className="zm-footnote-content-input"
                  value={footnote.content}
                  onChange={(e) => updateFootnote(index, e.target.value)}
                  placeholder={t.placeholder}
                  autoFocus={index === editingFootnotes.length - 1}
                />
                <button
                  type="button"
                  className="zm-footnote-remove-btn"
                  onClick={() => removeFootnote(index)}
                  title={t.remove}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="zm-footnote-add-btn" onClick={addFootnote}>
            <PlusIcon />
            <span>{t.add}</span>
          </button>

          <div className="zm-footnote-hint">{t.hint}</div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="zm-footnote-wrapper">
      <div
        className="zm-footnote"
        data-selected={selected}
        onClick={startEditing}
        ref={containerRef}
      >
        <div className="zm-footnote-header" contentEditable={false}>
          <div className="zm-footnote-title">
            <FootnoteIcon />
            <span>{t.title}</span>
          </div>
        </div>

        {footnotes.length > 0 ? (
          <div className="zm-footnote-list" contentEditable={false}>
            {footnotes.map((footnote, index) => (
              <div key={index} className="zm-footnote-item">
                <span className="zm-footnote-number">[{footnote.id}]</span>
                <span className="zm-footnote-content">{footnote.content}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="zm-footnote-empty" contentEditable={false}>
            {t.clickToAdd}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default FootnoteNode;
