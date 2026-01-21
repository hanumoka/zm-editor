'use client';

import { NodeViewContent, NodeViewWrapper, NodeViewProps } from '@tiptap/react';

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
 * CodeBlock - 언어 선택이 가능한 코드 블록 컴포넌트
 */
export function CodeBlock({ node, updateAttributes }: NodeViewProps) {
  const currentLanguage = node.attrs.language || '';

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    updateAttributes({ language: event.target.value });
  };

  return (
    <NodeViewWrapper className="zm-code-block-wrapper">
      <div className="zm-code-block-header">
        <select
          className="zm-code-block-language-select"
          value={currentLanguage}
          onChange={handleLanguageChange}
          contentEditable={false}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <pre className="zm-code-block">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

export default CodeBlock;
