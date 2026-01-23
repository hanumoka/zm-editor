'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useLocale } from '../../context';

export type ChangelogNodeProps = NodeViewProps;

export type ChangeType = 'added' | 'changed' | 'fixed' | 'removed';

export interface ChangeEntry {
  id: string;
  type: ChangeType;
  text: string;
}

const CHANGE_TYPES: Record<
  ChangeType,
  { label: string; color: string; bgColor: string; darkBgColor: string; icon: string }
> = {
  added: {
    label: 'Added',
    color: '#22c55e',
    bgColor: '#dcfce7',
    darkBgColor: '#14532d',
    icon: '🟢',
  },
  changed: {
    label: 'Changed',
    color: '#eab308',
    bgColor: '#fef9c3',
    darkBgColor: '#713f12',
    icon: '🟡',
  },
  fixed: {
    label: 'Fixed',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    darkBgColor: '#1e3a8a',
    icon: '🔵',
  },
  removed: {
    label: 'Removed',
    color: '#ef4444',
    bgColor: '#fee2e2',
    darkBgColor: '#7f1d1d',
    icon: '🔴',
  },
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * ChangelogNode - Changelog/Release notes block
 * Following Keep a Changelog format
 */
export function ChangelogNode({ node, updateAttributes, selected }: ChangelogNodeProps) {
  const locale = useLocale();
  const { version = '', date = '', changes = '[]' } = node.attrs;

  const [isEditing, setIsEditing] = useState(false);
  const [versionValue, setVersionValue] = useState(version);
  const [dateValue, setDateValue] = useState(date);
  const [changesValue, setChangesValue] = useState<ChangeEntry[]>([]);
  const [newEntryType, setNewEntryType] = useState<ChangeType>('added');
  const [newEntryText, setNewEntryText] = useState('');

  const versionInputRef = useRef<HTMLInputElement>(null);
  const entryInputRef = useRef<HTMLInputElement>(null);

  // Parse changes from JSON string
  useEffect(() => {
    try {
      const parsed = JSON.parse(changes);
      if (Array.isArray(parsed)) {
        setChangesValue(parsed);
      }
    } catch {
      setChangesValue([]);
    }
  }, [changes]);

  // Initial editing state
  useEffect(() => {
    if (!version && !date && changes === '[]') {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync values
  useEffect(() => {
    setVersionValue(version);
    setDateValue(date);
  }, [version, date]);

  // Focus version input when editing
  useEffect(() => {
    if (isEditing && versionInputRef.current) {
      versionInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    updateAttributes({
      version: versionValue.trim(),
      date: dateValue.trim(),
      changes: JSON.stringify(changesValue),
    });
    if (versionValue.trim() || changesValue.length > 0) {
      setIsEditing(false);
    }
  }, [versionValue, dateValue, changesValue, updateAttributes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (version || changesValue.length > 0) {
          setVersionValue(version);
          setDateValue(date);
          try {
            setChangesValue(JSON.parse(changes));
          } catch {
            setChangesValue([]);
          }
          setIsEditing(false);
        }
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave, version, date, changes, changesValue]
  );

  const handleAddEntry = useCallback(() => {
    if (!newEntryText.trim()) return;

    const newEntry: ChangeEntry = {
      id: generateId(),
      type: newEntryType,
      text: newEntryText.trim(),
    };

    const updatedChanges = [...changesValue, newEntry];
    setChangesValue(updatedChanges);
    setNewEntryText('');

    // Auto-save
    updateAttributes({
      changes: JSON.stringify(updatedChanges),
    });

    // Focus back to input
    entryInputRef.current?.focus();
  }, [newEntryType, newEntryText, changesValue, updateAttributes]);

  const handleEntryKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAddEntry();
      }
    },
    [handleAddEntry]
  );

  const handleRemoveEntry = useCallback(
    (id: string) => {
      const updatedChanges = changesValue.filter((entry) => entry.id !== id);
      setChangesValue(updatedChanges);
      updateAttributes({
        changes: JSON.stringify(updatedChanges),
      });
    },
    [changesValue, updateAttributes]
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Group changes by type for display
  const groupedChanges = useMemo(() => {
    const groups: Record<ChangeType, ChangeEntry[]> = {
      added: [],
      changed: [],
      fixed: [],
      removed: [],
    };

    changesValue.forEach((entry) => {
      if (groups[entry.type]) {
        groups[entry.type].push(entry);
      }
    });

    return groups;
  }, [changesValue]);

  // Locale strings
  const t = locale.nodes?.changelog || {
    version: 'Version',
    date: 'Date',
    versionPlaceholder: 'v1.0.0',
    datePlaceholder: 'YYYY-MM-DD',
    added: 'Added',
    changed: 'Changed',
    fixed: 'Fixed',
    removed: 'Removed',
    addEntry: 'Add entry',
    removeEntry: 'Remove',
    save: 'Save',
    cancel: 'Cancel',
    clickToEdit: 'Click to edit',
    entryPlaceholder: 'Describe the change...',
    noChanges: 'No changes recorded',
    hint: 'Ctrl+Enter to confirm, Escape to cancel',
  };

  // Editing mode
  if (isEditing) {
    return (
      <NodeViewWrapper className="zm-changelog-wrapper">
        <div
          className={`zm-changelog zm-changelog-editing ${selected ? 'is-selected' : ''}`}
          data-drag-handle
        >
          {/* Header inputs */}
          <div className="zm-changelog-header-edit">
            <div className="zm-changelog-input-group">
              <label className="zm-changelog-label">{t.version}</label>
              <input
                ref={versionInputRef}
                type="text"
                className="zm-changelog-version-input"
                value={versionValue}
                onChange={(e) => setVersionValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.versionPlaceholder}
              />
            </div>
            <div className="zm-changelog-input-group">
              <label className="zm-changelog-label">{t.date}</label>
              <input
                type="text"
                className="zm-changelog-date-input"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.datePlaceholder}
              />
            </div>
            <button
              type="button"
              className="zm-changelog-save-btn"
              onClick={handleSave}
              title={t.save}
            >
              <CheckIcon />
              <span>{t.save}</span>
            </button>
          </div>

          {/* Add entry row */}
          <div className="zm-changelog-add-row">
            <select
              className="zm-changelog-type-select"
              value={newEntryType}
              onChange={(e) => setNewEntryType(e.target.value as ChangeType)}
            >
              <option value="added">{t.added}</option>
              <option value="changed">{t.changed}</option>
              <option value="fixed">{t.fixed}</option>
              <option value="removed">{t.removed}</option>
            </select>
            <input
              ref={entryInputRef}
              type="text"
              className="zm-changelog-entry-input"
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
              onKeyDown={handleEntryKeyDown}
              placeholder={t.entryPlaceholder}
            />
            <button
              type="button"
              className="zm-changelog-add-btn"
              onClick={handleAddEntry}
              disabled={!newEntryText.trim()}
              title={t.addEntry}
            >
              <PlusIcon />
            </button>
          </div>

          {/* Entries list */}
          <div className="zm-changelog-entries">
            {changesValue.length === 0 ? (
              <div className="zm-changelog-empty">{t.noChanges}</div>
            ) : (
              changesValue.map((entry) => {
                const typeInfo = CHANGE_TYPES[entry.type];
                return (
                  <div key={entry.id} className="zm-changelog-entry">
                    <span
                      className="zm-changelog-entry-badge"
                      style={{ backgroundColor: typeInfo.bgColor, color: typeInfo.color }}
                    >
                      {typeInfo.icon} {t[entry.type] || typeInfo.label}
                    </span>
                    <span className="zm-changelog-entry-text">{entry.text}</span>
                    <button
                      type="button"
                      className="zm-changelog-entry-delete"
                      onClick={() => handleRemoveEntry(entry.id)}
                      title={t.removeEntry}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="zm-changelog-hint">
            {t.hint}
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // Display mode
  return (
    <NodeViewWrapper className="zm-changelog-wrapper">
      <div
        className={`zm-changelog zm-changelog-display ${selected ? 'is-selected' : ''}`}
        data-drag-handle
        onClick={handleEdit}
      >
        {/* Header */}
        <div className="zm-changelog-header">
          <div className="zm-changelog-header-left">
            <span className="zm-changelog-icon">📋</span>
            <span className="zm-changelog-version">
              {version || t.versionPlaceholder}
            </span>
          </div>
          {date && <span className="zm-changelog-date">{date}</span>}
        </div>

        {/* Content */}
        <div className="zm-changelog-content">
          {changesValue.length === 0 ? (
            <div className="zm-changelog-empty">{t.noChanges}</div>
          ) : (
            (Object.keys(CHANGE_TYPES) as ChangeType[]).map((type) => {
              const entries = groupedChanges[type];
              if (entries.length === 0) return null;

              const typeInfo = CHANGE_TYPES[type];
              return (
                <div key={type} className="zm-changelog-group">
                  <div
                    className="zm-changelog-group-title"
                    style={{ color: typeInfo.color }}
                  >
                    {typeInfo.icon} {t[type] || typeInfo.label}
                  </div>
                  <ul className="zm-changelog-group-list">
                    {entries.map((entry) => (
                      <li key={entry.id} className="zm-changelog-group-item">
                        {entry.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default ChangelogNode;
