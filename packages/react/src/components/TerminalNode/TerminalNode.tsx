'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useLocale } from '../../context/LocaleContext';

export type TerminalNodeProps = NodeViewProps;

// 아이콘 컴포넌트들
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

const TerminalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

/**
 * TerminalNode - 터미널/CLI 블록 NodeView
 *
 * 명령어 입력과 출력을 터미널 스타일로 표시합니다.
 */
export function TerminalNode({ node, updateAttributes, selected }: TerminalNodeProps) {
  const { command = '', output = '' } = node.attrs;
  const locale = useLocale();
  const t = locale.nodes.terminal;

  const [copiedCommand, setCopiedCommand] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [isEditing, setIsEditing] = useState(!command);

  const commandInputRef = useRef<HTMLInputElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const copyCommandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const copyOutputTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (copyCommandTimeoutRef.current) {
        clearTimeout(copyCommandTimeoutRef.current);
      }
      if (copyOutputTimeoutRef.current) {
        clearTimeout(copyOutputTimeoutRef.current);
      }
    };
  }, []);

  // 명령어 입력 포커스
  useEffect(() => {
    if (isEditing && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [isEditing]);

  // 명령어 복사
  const handleCopyCommand = useCallback(async () => {
    if (!command) return;

    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(true);

      if (copyCommandTimeoutRef.current) {
        clearTimeout(copyCommandTimeoutRef.current);
      }
      copyCommandTimeoutRef.current = setTimeout(() => setCopiedCommand(false), 2000);
    } catch (err) {
      console.error('Failed to copy command:', err);
    }
  }, [command]);

  // 출력 복사
  const handleCopyOutput = useCallback(async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopiedOutput(true);

      if (copyOutputTimeoutRef.current) {
        clearTimeout(copyOutputTimeoutRef.current);
      }
      copyOutputTimeoutRef.current = setTimeout(() => setCopiedOutput(false), 2000);
    } catch (err) {
      console.error('Failed to copy output:', err);
    }
  }, [output]);

  // 명령어 변경
  const handleCommandChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateAttributes({ command: e.target.value });
    },
    [updateAttributes]
  );

  // 명령어 입력 완료
  const handleCommandKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && command.trim()) {
        setIsEditing(false);
        // 출력 영역이 있으면 포커스 이동
        if (outputTextareaRef.current) {
          outputTextareaRef.current.focus();
        }
      }
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [command]
  );

  // 출력 변경
  const handleOutputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateAttributes({ output: e.target.value });
    },
    [updateAttributes]
  );

  // 출력 영역 높이 자동 조절
  const handleOutputInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  return (
    <NodeViewWrapper className="zm-terminal-node-wrapper">
      <div className={`zm-terminal-node ${selected ? 'is-selected' : ''}`}>
        {/* 터미널 헤더 */}
        <div className="zm-terminal-header">
          <div className="zm-terminal-header-left">
            <span className="zm-terminal-icon">
              <TerminalIcon />
            </span>
            <span className="zm-terminal-title">{t.title}</span>
          </div>
          <div className="zm-terminal-header-right">
            {command && (
              <button
                type="button"
                className={`zm-terminal-copy-btn ${copiedCommand ? 'copied' : ''}`}
                onClick={handleCopyCommand}
                title={copiedCommand ? t.copied : t.copyCommand}
              >
                {copiedCommand ? <CheckIcon /> : <CopyIcon />}
                <span>{copiedCommand ? t.copied : t.copyCommand}</span>
              </button>
            )}
          </div>
        </div>

        {/* 명령어 영역 */}
        <div className="zm-terminal-command-area">
          <span className="zm-terminal-prompt">$</span>
          {isEditing ? (
            <input
              ref={commandInputRef}
              type="text"
              className="zm-terminal-command-input"
              value={command}
              onChange={handleCommandChange}
              onKeyDown={handleCommandKeyDown}
              onBlur={() => command.trim() && setIsEditing(false)}
              placeholder={t.commandPlaceholder}
              spellCheck={false}
            />
          ) : (
            <code
              className="zm-terminal-command"
              onClick={() => setIsEditing(true)}
              title={t.clickToEdit}
            >
              {command || t.commandPlaceholder}
            </code>
          )}
        </div>

        {/* 출력 영역 (있는 경우에만 표시, 또는 선택 시 편집 가능) */}
        {(output || selected) && (
          <div className="zm-terminal-output-area">
            <div className="zm-terminal-output-header">
              <span className="zm-terminal-output-label">{t.output}</span>
              {output && (
                <button
                  type="button"
                  className={`zm-terminal-copy-btn sm ${copiedOutput ? 'copied' : ''}`}
                  onClick={handleCopyOutput}
                  title={copiedOutput ? t.copied : t.copyOutput}
                >
                  {copiedOutput ? <CheckIcon /> : <CopyIcon />}
                </button>
              )}
            </div>
            <textarea
              ref={outputTextareaRef}
              className="zm-terminal-output"
              value={output}
              onChange={handleOutputChange}
              onInput={handleOutputInput}
              placeholder={t.outputPlaceholder}
              spellCheck={false}
              rows={output ? undefined : 2}
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default TerminalNode;
