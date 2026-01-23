'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

// 아이콘 컴포넌트들
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

// 지원 언어 목록
const LANGUAGES = [
  { value: '', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'dockerfile', label: 'Dockerfile' },
];

/**
 * CodeBlock - 라인 넘버, 파일명, 복사 기능이 있는 코드 블록 컴포넌트
 */
export function CodeBlock({ node, updateAttributes }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [filenameInput, setFilenameInput] = useState('');
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filenameInputRef = useRef<HTMLInputElement>(null);
  const currentLanguage = node.attrs.language || '';
  const filename = node.attrs.filename || '';

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // 파일명 편집 시작 시 포커스
  useEffect(() => {
    if (isEditingFilename && filenameInputRef.current) {
      filenameInputRef.current.focus();
      filenameInputRef.current.select();
    }
  }, [isEditingFilename]);

  // 파일명 편집 시작
  const startEditFilename = useCallback(() => {
    setFilenameInput(filename);
    setIsEditingFilename(true);
  }, [filename]);

  // 파일명 저장
  const saveFilename = useCallback(() => {
    updateAttributes({ filename: filenameInput.trim() });
    setIsEditingFilename(false);
  }, [filenameInput, updateAttributes]);

  // 파일명 입력 키 핸들러
  const handleFilenameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        saveFilename();
      } else if (e.key === 'Escape') {
        setIsEditingFilename(false);
      }
    },
    [saveFilename]
  );

  // 코드 복사 핸들러
  const handleCopy = useCallback(async () => {
    const code = node.textContent;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      // 기존 타이머 클리어
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [node.textContent]);

  // 라인 수 계산
  const lineCount = useMemo(() => {
    const content = node.textContent || '';
    return Math.max(content.split('\n').length, 1);
  }, [node.textContent]);

  // 라인 넘버 배열 생성
  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [lineCount]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: event.target.value });
  };

  return (
    <NodeViewWrapper className="zm-code-block-wrapper">
      <div className="zm-code-block-header">
        {/* 파일명 영역 */}
        <div className="zm-code-block-filename-area" contentEditable={false}>
          {isEditingFilename ? (
            <input
              ref={filenameInputRef}
              type="text"
              className="zm-code-block-filename-input"
              value={filenameInput}
              onChange={(e) => setFilenameInput(e.target.value)}
              onKeyDown={handleFilenameKeyDown}
              onBlur={saveFilename}
              placeholder="filename.ext"
              spellCheck={false}
            />
          ) : filename ? (
            <button
              type="button"
              className="zm-code-block-filename"
              onClick={startEditFilename}
              title="Click to edit filename"
            >
              <FileIcon />
              <span>{filename}</span>
            </button>
          ) : (
            <button
              type="button"
              className="zm-code-block-add-filename"
              onClick={startEditFilename}
              title="Add filename"
            >
              <FileIcon />
              <span>Add filename</span>
            </button>
          )}
        </div>

        {/* 언어 선택 및 복사 버튼 */}
        <div className="zm-code-block-actions" contentEditable={false}>
          <select
            className="zm-code-block-language-select"
            value={currentLanguage}
            onChange={handleLanguageChange}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`zm-code-block-copy-button ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>

      <div className="zm-code-block-container">
        <div className="zm-code-block-line-numbers" contentEditable={false}>
          {lineNumbers.map((num) => (
            <span key={num} className="zm-code-block-line-number">
              {num}
            </span>
          ))}
        </div>
        <pre className="zm-code-block">
          <NodeViewContent as="code" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

export default CodeBlock;
