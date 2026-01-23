'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useLocale } from '../../context';

// Icons
const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UnlockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

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

export interface EnvVariable {
  key: string;
  value: string;
  masked: boolean;
}

export interface EnvBlockNodeProps extends NodeViewProps {}

export function EnvBlockNode({ node, updateAttributes, selected }: EnvBlockNodeProps) {
  const locale = useLocale();
  const t = locale.nodes.envBlock;

  const [isEditing, setIsEditing] = useState(false);
  const [showValues, setShowValues] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingVariables, setEditingVariables] = useState<EnvVariable[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const variables: EnvVariable[] = node.attrs.variables || [];
  const title = node.attrs.title || '';

  // Cleanup
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Start editing
  const startEditing = useCallback(() => {
    setEditingVariables(variables.length > 0 ? [...variables] : [{ key: '', value: '', masked: true }]);
    setIsEditing(true);
  }, [variables]);

  // Save changes
  const saveChanges = useCallback(() => {
    const validVariables = editingVariables.filter(v => v.key.trim() !== '');
    updateAttributes({ variables: validVariables });
    setIsEditing(false);
  }, [editingVariables, updateAttributes]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Add variable
  const addVariable = useCallback(() => {
    setEditingVariables(prev => [...prev, { key: '', value: '', masked: true }]);
  }, []);

  // Remove variable
  const removeVariable = useCallback((index: number) => {
    setEditingVariables(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update variable
  const updateVariable = useCallback((index: number, field: keyof EnvVariable, value: string | boolean) => {
    setEditingVariables(prev => prev.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    ));
  }, []);

  // Copy all as .env format
  const copyAsEnv = useCallback(async () => {
    const envContent = variables
      .map(v => `${v.key}=${v.value}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(envContent);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [variables]);

  // Handle key down in editing mode
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelEditing();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      saveChanges();
    }
  }, [cancelEditing, saveChanges]);

  // Mask value
  const maskValue = (value: string) => '•'.repeat(Math.min(value.length || 8, 16));

  if (isEditing) {
    return (
      <NodeViewWrapper className="zm-env-block-wrapper">
        <div
          className="zm-env-block editing"
          data-selected={selected}
          onKeyDown={handleKeyDown}
          ref={containerRef}
        >
          <div className="zm-env-block-header">
            <input
              type="text"
              className="zm-env-block-title-input"
              value={title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              placeholder={t.titlePlaceholder}
            />
            <div className="zm-env-block-actions">
              <button type="button" onClick={saveChanges} className="zm-env-block-save-btn" title={t.save}>
                <CheckIcon />
              </button>
            </div>
          </div>

          <div className="zm-env-block-variables">
            {editingVariables.map((variable, index) => (
              <div key={index} className="zm-env-block-variable-row editing">
                <input
                  type="text"
                  className="zm-env-block-key-input"
                  value={variable.key}
                  onChange={(e) => updateVariable(index, 'key', e.target.value)}
                  placeholder={t.keyPlaceholder}
                />
                <input
                  type="text"
                  className="zm-env-block-value-input"
                  value={variable.value}
                  onChange={(e) => updateVariable(index, 'value', e.target.value)}
                  placeholder={t.valuePlaceholder}
                />
                <label className="zm-env-block-masked-toggle">
                  <input
                    type="checkbox"
                    checked={variable.masked}
                    onChange={(e) => updateVariable(index, 'masked', e.target.checked)}
                  />
                  <span title={variable.masked ? t.masked : t.visible}>
                    {variable.masked ? <LockIcon /> : <UnlockIcon />}
                  </span>
                </label>
                <button
                  type="button"
                  className="zm-env-block-remove-btn"
                  onClick={() => removeVariable(index)}
                  title={t.removeVariable}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="zm-env-block-add-btn" onClick={addVariable}>
            <PlusIcon />
            <span>{t.addVariable}</span>
          </button>

          <div className="zm-env-block-hint">{t.hint}</div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="zm-env-block-wrapper">
      <div
        className="zm-env-block"
        data-selected={selected}
        onClick={startEditing}
        ref={containerRef}
      >
        <div className="zm-env-block-header" contentEditable={false}>
          <div className="zm-env-block-title">
            <LockIcon />
            <span>{title || t.defaultTitle}</span>
          </div>
          <div className="zm-env-block-actions" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`zm-env-block-toggle-btn ${showValues ? 'active' : ''}`}
              onClick={() => setShowValues(!showValues)}
              title={showValues ? t.hideValues : t.showValues}
            >
              {showValues ? <UnlockIcon /> : <LockIcon />}
            </button>
            <button
              type="button"
              className={`zm-env-block-copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyAsEnv}
              title={copied ? t.copied : t.copy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        {variables.length > 0 ? (
          <div className="zm-env-block-variables" contentEditable={false}>
            {variables.map((variable, index) => (
              <div key={index} className="zm-env-block-variable-row">
                <span className="zm-env-block-key">{variable.key}</span>
                <span className="zm-env-block-separator">=</span>
                <span className={`zm-env-block-value ${variable.masked && !showValues ? 'masked' : ''}`}>
                  {variable.masked && !showValues ? maskValue(variable.value) : variable.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="zm-env-block-empty" contentEditable={false}>
            {t.clickToAdd}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default EnvBlockNode;
