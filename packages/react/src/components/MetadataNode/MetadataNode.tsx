'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context';

export type MetadataNodeProps = NodeViewProps;

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_STYLES: Record<DifficultyLevel, { color: string; label: string }> = {
  beginner: { color: 'zm-meta-difficulty-beginner', label: 'Beginner' },
  intermediate: { color: 'zm-meta-difficulty-intermediate', label: 'Intermediate' },
  advanced: { color: 'zm-meta-difficulty-advanced', label: 'Advanced' },
};

/**
 * MetadataNode - 문서 메타데이터 블록
 */
export function MetadataNode({ node, updateAttributes, selected }: MetadataNodeProps) {
  const locale = useLocale();
  const {
    author = '',
    difficulty = '',
    duration = '',
    lastUpdated = '',
    tags = '',
    customFields = '',
  } = node.attrs;

  const [isEditing, setIsEditing] = useState(false);
  const [authorValue, setAuthorValue] = useState(author);
  const [difficultyValue, setDifficultyValue] = useState(difficulty);
  const [durationValue, setDurationValue] = useState(duration);
  const [lastUpdatedValue, setLastUpdatedValue] = useState(lastUpdated);
  const [tagsValue, setTagsValue] = useState(tags);
  const [customFieldsValue, setCustomFieldsValue] = useState(customFields);
  const authorInputRef = useRef<HTMLInputElement>(null);

  // Initial edit mode if empty
  useEffect(() => {
    if (!author && !difficulty && !duration && !tags) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync values
  useEffect(() => {
    setAuthorValue(author);
    setDifficultyValue(difficulty);
    setDurationValue(duration);
    setLastUpdatedValue(lastUpdated);
    setTagsValue(tags);
    setCustomFieldsValue(customFields);
  }, [author, difficulty, duration, lastUpdated, tags, customFields]);

  // Focus on edit mode
  useEffect(() => {
    if (isEditing && authorInputRef.current) {
      authorInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      author: authorValue.trim(),
      difficulty: difficultyValue,
      duration: durationValue.trim(),
      lastUpdated: lastUpdatedValue.trim(),
      tags: tagsValue.trim(),
      customFields: customFieldsValue.trim(),
    });
    if (authorValue.trim() || difficultyValue || durationValue.trim() || tagsValue.trim()) {
      setIsEditing(false);
    }
  }, [authorValue, difficultyValue, durationValue, lastUpdatedValue, tagsValue, customFieldsValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAuthorValue(author);
        setDifficultyValue(difficulty);
        setDurationValue(duration);
        setLastUpdatedValue(lastUpdated);
        setTagsValue(tags);
        setCustomFieldsValue(customFields);
        setIsEditing(false);
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, author, difficulty, duration, lastUpdated, tags, customFields]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const parseTags = (tagString: string): string[] => {
    return tagString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const parseCustomFields = (fieldsString: string): Array<{ key: string; value: string }> => {
    try {
      const fields = JSON.parse(fieldsString);
      return Object.entries(fields).map(([key, value]) => ({ key, value: String(value) }));
    } catch {
      return [];
    }
  };

  // Edit mode
  if (isEditing) {
    return (
      <NodeViewWrapper className="zm-metadata-wrapper">
        <div
          className={`zm-metadata zm-metadata-editing ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          <div className="zm-metadata-title">
            {locale.nodes?.metadata?.title || 'Document Metadata'}
          </div>

          <div className="zm-metadata-edit-grid">
            {/* Author */}
            <div className="zm-metadata-field">
              <label className="zm-metadata-label">
                <AuthorIcon />
                {locale.nodes?.metadata?.author || 'Author'}
              </label>
              <input
                ref={authorInputRef}
                type="text"
                className="zm-metadata-input"
                value={authorValue}
                onChange={(e) => setAuthorValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale.nodes?.metadata?.authorPlaceholder || 'John Doe'}
              />
            </div>

            {/* Difficulty */}
            <div className="zm-metadata-field">
              <label className="zm-metadata-label">
                <DifficultyIcon />
                {locale.nodes?.metadata?.difficulty || 'Difficulty'}
              </label>
              <select
                className="zm-metadata-select"
                value={difficultyValue}
                onChange={(e) => setDifficultyValue(e.target.value)}
              >
                <option value="">-</option>
                <option value="beginner">{locale.nodes?.metadata?.beginner || 'Beginner'}</option>
                <option value="intermediate">{locale.nodes?.metadata?.intermediate || 'Intermediate'}</option>
                <option value="advanced">{locale.nodes?.metadata?.advanced || 'Advanced'}</option>
              </select>
            </div>

            {/* Duration */}
            <div className="zm-metadata-field">
              <label className="zm-metadata-label">
                <DurationIcon />
                {locale.nodes?.metadata?.duration || 'Duration'}
              </label>
              <input
                type="text"
                className="zm-metadata-input"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale.nodes?.metadata?.durationPlaceholder || '15 min'}
              />
            </div>

            {/* Last Updated */}
            <div className="zm-metadata-field">
              <label className="zm-metadata-label">
                <CalendarIcon />
                {locale.nodes?.metadata?.lastUpdated || 'Last Updated'}
              </label>
              <input
                type="text"
                className="zm-metadata-input"
                value={lastUpdatedValue}
                onChange={(e) => setLastUpdatedValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale.nodes?.metadata?.datePlaceholder || '2024-01-24'}
              />
            </div>

            {/* Tags */}
            <div className="zm-metadata-field zm-metadata-field-full">
              <label className="zm-metadata-label">
                <TagIcon />
                {locale.nodes?.metadata?.tags || 'Tags'}
              </label>
              <input
                type="text"
                className="zm-metadata-input"
                value={tagsValue}
                onChange={(e) => setTagsValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale.nodes?.metadata?.tagsPlaceholder || 'react, tutorial, beginner'}
              />
            </div>

            {/* Custom Fields (JSON) */}
            <div className="zm-metadata-field zm-metadata-field-full">
              <label className="zm-metadata-label">
                <CustomIcon />
                {locale.nodes?.metadata?.customFields || 'Custom Fields (JSON)'}
              </label>
              <textarea
                className="zm-metadata-textarea"
                value={customFieldsValue}
                onChange={(e) => setCustomFieldsValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                placeholder={locale.nodes?.metadata?.customFieldsPlaceholder || '{"version": "1.0", "category": "Tutorial"}'}
                rows={2}
              />
            </div>
          </div>

          <div className="zm-metadata-hint">
            {locale.nodes?.metadata?.hint || 'Ctrl+Enter to confirm, Escape to cancel'}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Display mode
  const tagList = parseTags(tags);
  const customFieldsList = parseCustomFields(customFields);
  const hasContent = author || difficulty || duration || lastUpdated || tagList.length > 0 || customFieldsList.length > 0;

  if (!hasContent) {
    return (
      <NodeViewWrapper className="zm-metadata-wrapper">
        <div
          className={`zm-metadata zm-metadata-empty ${selected ? 'is-selected' : ''}`}
          data-drag-handle
          onClick={handleEdit}
        >
          <span className="zm-metadata-empty-text">
            {locale.nodes?.metadata?.clickToAdd || 'Click to add metadata'}
          </span>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="zm-metadata-wrapper">
      <div
        className={`zm-metadata zm-metadata-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={handleEdit}
      >
        <div className="zm-metadata-display-grid">
          {author && (
            <div className="zm-metadata-item">
              <AuthorIcon />
              <span className="zm-metadata-item-value">{author}</span>
            </div>
          )}

          {difficulty && DIFFICULTY_STYLES[difficulty as DifficultyLevel] && (
            <div className="zm-metadata-item">
              <DifficultyIcon />
              <span className={`zm-metadata-difficulty-badge ${DIFFICULTY_STYLES[difficulty as DifficultyLevel].color}`}>
                {DIFFICULTY_STYLES[difficulty as DifficultyLevel].label}
              </span>
            </div>
          )}

          {duration && (
            <div className="zm-metadata-item">
              <DurationIcon />
              <span className="zm-metadata-item-value">{duration}</span>
            </div>
          )}

          {lastUpdated && (
            <div className="zm-metadata-item">
              <CalendarIcon />
              <span className="zm-metadata-item-value">{lastUpdated}</span>
            </div>
          )}

          {tagList.length > 0 && (
            <div className="zm-metadata-item zm-metadata-tags">
              <TagIcon />
              <div className="zm-metadata-tag-list">
                {tagList.map((tag, idx) => (
                  <span key={idx} className="zm-metadata-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {customFieldsList.length > 0 && customFieldsList.map((field, idx) => (
            <div key={idx} className="zm-metadata-item">
              <CustomIcon />
              <span className="zm-metadata-custom-key">{field.key}:</span>
              <span className="zm-metadata-item-value">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="zm-metadata-toolbar">
          <button
            type="button"
            className="zm-metadata-toolbar-btn"
            onClick={handleEdit}
            title={locale.nodes?.metadata?.edit || 'Edit'}
          >
            <EditIcon />
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

function AuthorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function DifficultyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function DurationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function CustomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
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

export default MetadataNode;
