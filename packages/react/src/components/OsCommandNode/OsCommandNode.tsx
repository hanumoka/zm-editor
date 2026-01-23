'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context/LocaleContext';

export type OsCommandNodeProps = NodeViewProps;

type OsTab = 'macos' | 'linux' | 'windows';

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

const AppleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const LinuxIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.86 0 3.41 1.28 3.86 3H8.14c.45-1.72 2-3 3.86-3zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 5l-2-4h2.5l1.5 3 1.5-3H14l-2 4H8zm10-5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

const WindowsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 5.557l7.357-1.002v7.102H3V5.557zm0 12.886l7.357 1.002v-7.102H3v6.1zm8.143 1.124L22 21v-8.657h-10.857v7.224zm0-14.134v7.224H22V3L11.143 5.433z"/>
  </svg>
);

const OS_ICONS: Record<OsTab, () => React.ReactElement> = {
  macos: AppleIcon,
  linux: LinuxIcon,
  windows: WindowsIcon,
};

const OS_PROMPTS: Record<OsTab, string> = {
  macos: '$',
  linux: '$',
  windows: '>',
};

/**
 * OsCommandNode - OS별 명령어 탭 블록 NodeView
 *
 * macOS, Linux, Windows 명령어를 탭으로 전환하며 표시
 */
export function OsCommandNode({ node, updateAttributes, selected }: OsCommandNodeProps) {
  const {
    macosCommand = '',
    linuxCommand = '',
    windowsCommand = '',
  } = node.attrs;

  const locale = useLocale();
  const t = locale.nodes?.osCommand || {
    macos: 'macOS',
    linux: 'Linux',
    windows: 'Windows',
    commandPlaceholder: 'Enter command...',
    copyCommand: 'Copy command',
    copied: 'Copied!',
    clickToEdit: 'Click to edit',
  };

  const [activeTab, setActiveTab] = useState<OsTab>('macos');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedTab, setCopiedTab] = useState<OsTab | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current command based on active tab
  const currentCommand = activeTab === 'macos' ? macosCommand :
                         activeTab === 'linux' ? linuxCommand : windowsCommand;

  // Start editing if all commands are empty (only on mount)
  useEffect(() => {
    if (!macosCommand && !linuxCommand && !windowsCommand) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only check on mount

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing, activeTab]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Update command for current tab
  const handleCommandChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (activeTab === 'macos') {
        updateAttributes({ macosCommand: value });
      } else if (activeTab === 'linux') {
        updateAttributes({ linuxCommand: value });
      } else {
        updateAttributes({ windowsCommand: value });
      }
    },
    [activeTab, updateAttributes]
  );

  // Handle key events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsEditing(false);
      }
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
      // Tab switching with Ctrl+1/2/3
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('macos');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('linux');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('windows');
        }
      }
    },
    []
  );

  // Copy command
  const handleCopy = useCallback(async () => {
    if (!currentCommand) return;

    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopiedTab(activeTab);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  }, [currentCommand, activeTab]);

  // Tab change
  const handleTabChange = useCallback((tab: OsTab) => {
    setActiveTab(tab);
  }, []);

  // Enter edit mode
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // Exit edit mode on blur
  const handleBlur = useCallback(() => {
    // Clear any existing blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    // Small delay to allow tab switching to complete
    blurTimeoutRef.current = setTimeout(() => {
      if (document.activeElement !== inputRef.current) {
        setIsEditing(false);
      }
    }, 100);
  }, []);

  const tabs: OsTab[] = ['macos', 'linux', 'windows'];
  const tabLabels: Record<OsTab, string> = {
    macos: t.macos,
    linux: t.linux,
    windows: t.windows,
  };

  return (
    <NodeViewWrapper className="zm-os-command-wrapper">
      <div
        className={`zm-os-command ${selected ? 'is-selected' : ''}`}
        data-drag-handle
      >
        {/* Tab buttons */}
        <div className="zm-os-command-tabs">
          {tabs.map((tab) => {
            const Icon = OS_ICONS[tab];
            return (
              <button
                key={tab}
                type="button"
                className={`zm-os-command-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => handleTabChange(tab)}
              >
                <Icon />
                <span>{tabLabels[tab]}</span>
              </button>
            );
          })}
        </div>

        {/* Command content */}
        <div className="zm-os-command-content">
          <span className="zm-os-command-prompt">{OS_PROMPTS[activeTab]}</span>

          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="zm-os-command-input"
              value={currentCommand}
              onChange={handleCommandChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={t.commandPlaceholder}
              spellCheck={false}
            />
          ) : (
            <code
              className="zm-os-command-text"
              onClick={handleEdit}
              title={t.clickToEdit}
            >
              {currentCommand || t.commandPlaceholder}
            </code>
          )}

          {/* Copy button */}
          <button
            type="button"
            className={`zm-os-command-copy-btn ${copiedTab === activeTab ? 'copied' : ''}`}
            onClick={handleCopy}
            title={copiedTab === activeTab ? t.copied : t.copyCommand}
            disabled={!currentCommand}
          >
            {copiedTab === activeTab ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default OsCommandNode;
