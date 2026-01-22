'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { koLocale, enLocale, type ZmEditorRef, type JSONContent, type ImageUploadHandler } from '@zm-editor/react';

// SSR 비활성화하여 hydration 불일치 방지
const EditorWrapper = dynamic(() => import('./EditorWrapper'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center justify-center min-h-[300px]">
      <div className="text-gray-400">Loading editor...</div>
    </div>
  ),
});

// demoapi 서버 URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const initialContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'zm-editor Demo' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'React/Next.js용 Notion 스타일 리치 텍스트 에디터입니다. ' },
        { type: 'text', marks: [{ type: 'code' }], text: '/' },
        { type: 'text', text: '를 입력하여 다양한 블록을 추가해보세요!' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '구현된 기능' }],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '슬래시 명령어 (17개 블록 타입)' }] }],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '버블 메뉴 (텍스트 서식)' }] }],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '테이블 (행/열 추가, 셀 병합, 헤더)' }] }],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '이미지 (리사이즈, 정렬, 캡션)' }] }],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '코드블록 (26개 언어 신택스 하이라이팅)' }] }],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '수학 수식 (KaTeX LaTeX)' }] }],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '다국어 지원 (한국어/영어)' }] }],
        },
      ],
    },
    {
      type: 'horizontalRule',
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '아래에서 직접 편집해보세요! ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '텍스트를 선택' },
        { type: 'text', text: '하면 버블 메뉴가 나타납니다.' },
      ],
    },
  ],
};

export default function Home() {
  const editorRef = useRef<ZmEditorRef>(null);
  const [content, setContent] = useState<JSONContent>(initialContent);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');
  const [showJson, setShowJson] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdown, setMarkdown] = useState('');

  // 간단한 HTML to Markdown 변환 함수
  const htmlToMarkdown = useCallback((html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;

    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes).map(processNode).join('');

      switch (tag) {
        case 'h1': return `# ${children}\n\n`;
        case 'h2': return `## ${children}\n\n`;
        case 'h3': return `### ${children}\n\n`;
        case 'p': return `${children}\n\n`;
        case 'strong':
        case 'b': return `**${children}**`;
        case 'em':
        case 'i': return `*${children}*`;
        case 'u': return `<u>${children}</u>`;
        case 's':
        case 'strike': return `~~${children}~~`;
        case 'code': return el.parentElement?.tagName === 'PRE' ? children : `\`${children}\``;
        case 'pre': {
          const code = el.querySelector('code');
          const lang = code?.className.match(/language-(\w+)/)?.[1] || '';
          const text = code?.textContent || el.textContent || '';
          return `\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
        }
        case 'blockquote': return `> ${children.trim().replace(/\n/g, '\n> ')}\n\n`;
        case 'ul': return `${children}\n`;
        case 'ol': return `${children}\n`;
        case 'li': {
          const parent = el.parentElement;
          if (el.classList.contains('zm-task-item')) {
            const checkbox = el.querySelector('input[type="checkbox"]');
            const checked = checkbox?.hasAttribute('checked') ? 'x' : ' ';
            return `- [${checked}] ${children.trim()}\n`;
          }
          if (parent?.tagName === 'OL') {
            const index = Array.from(parent.children).indexOf(el) + 1;
            return `${index}. ${children.trim()}\n`;
          }
          return `- ${children.trim()}\n`;
        }
        case 'a': return `[${children}](${el.getAttribute('href') || ''})`;
        case 'img': return `![${el.getAttribute('alt') || ''}](${el.getAttribute('src') || ''})`;
        case 'hr': return `---\n\n`;
        case 'br': return '\n';
        case 'table': return `\n${children}\n`;
        case 'thead':
        case 'tbody': return children;
        case 'tr': {
          const cells = Array.from(el.children).map(cell => processNode(cell)).join(' | ');
          const isHeader = el.parentElement?.tagName === 'THEAD';
          if (isHeader) {
            const separator = Array.from(el.children).map(() => '---').join(' | ');
            return `| ${cells} |\n| ${separator} |\n`;
          }
          return `| ${cells} |\n`;
        }
        case 'th':
        case 'td': return children.trim();
        case 'mark': return `==${children}==`;
        default: return children;
      }
    };

    return processNode(div).trim().replace(/\n{3,}/g, '\n\n');
  }, []);

  // 이미지 업로드 핸들러 (demoapi 연동, 진행률 지원)
  const handleImageUpload: ImageUploadHandler = useCallback(async ({ file, onProgress }) => {
    setUploadStatus(`Uploading ${file.name}...`);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
          onProgress?.(percent);
        }
      });

      xhr.addEventListener('load', () => {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setUploadStatus(`Uploaded: ${file.name}`);
          setUploadProgress(100);
          setTimeout(() => {
            setUploadStatus('');
            setUploadProgress(0);
          }, 3000);

          resolve({ url: data.url, alt: file.name });
        } else {
          const error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: 'Upload failed' };
          setUploadStatus(`Failed: ${error.message || 'Unknown error'}`);
          reject(new Error(error.message || 'Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        setIsUploading(false);
        setUploadStatus('Failed: Network error');
        reject(new Error('Network error'));
      });

      xhr.open('POST', `${API_URL}/upload/image`);
      xhr.send(formData);
    });
  }, []);

  const handleImageUploadError = useCallback((error: Error, file: File) => {
    console.error('Image upload error:', error, file);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus(`Error: ${error.message}`);
    setTimeout(() => setUploadStatus(''), 5000);
  }, []);

  const handleExportJson = () => {
    const json = editorRef.current?.getJSON();
    if (json) {
      console.log('Editor JSON:', json);
      setShowJson(!showJson);
      if (!showJson) setShowMarkdown(false); // JSON 표시 시 Markdown 숨김
    }
  };

  const handleToggleMarkdown = () => {
    if (!showMarkdown) {
      const html = editorRef.current?.getHTML();
      if (html) {
        const md = htmlToMarkdown(html);
        setMarkdown(md);
        console.log('Editor Markdown:', md);
      }
      setShowJson(false); // Markdown 표시 시 JSON 숨김
    }
    setShowMarkdown(!showMarkdown);
  };

  const handleExportHtml = () => {
    const html = editorRef.current?.getHTML();
    if (html) {
      console.log('Editor HTML:', html);
      alert('HTML exported to console (F12)');
    }
  };

  const handleClear = () => {
    editorRef.current?.clear();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">zm-editor</h1>
              <p className="text-sm text-gray-500">Notion-like Rich Text Editor for React/Next.js</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Locale Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLocale('ko')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    locale === 'ko' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  한국어
                </button>
                <button
                  onClick={() => setLocale('en')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    locale === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={handleToggleMarkdown}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  showMarkdown ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showMarkdown ? 'Hide Markdown' : 'Show Markdown'}
              </button>
              <button
                onClick={handleExportJson}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  showJson ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showJson ? 'Hide JSON' : 'Show JSON'}
              </button>
              <button
                onClick={handleExportHtml}
                className="px-3 py-1.5 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Export HTML
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                Clear
              </button>
            </div>

            {/* Upload Status */}
            {(uploadStatus || isUploading) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
                  <span>{uploadStatus}</span>
                  {isUploading && <span>{uploadProgress}%</span>}
                </div>
                {isUploading && (
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <EditorWrapper
                ref={editorRef}
                initialContent={content}
                onChange={setContent}
                locale={locale === 'ko' ? koLocale : enLocale}
                placeholder={locale === 'ko' ? "'/'를 입력하여 명령어 사용..." : "Type '/' for commands..."}
                onImageUpload={handleImageUpload}
                onImageUploadError={handleImageUploadError}
              />
            </div>

            {/* Markdown Output */}
            {showMarkdown && (
              <div className="mt-4 bg-gray-900 rounded-xl p-4 overflow-auto max-h-96">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-purple-400 font-semibold">Markdown</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(markdown);
                      alert('Markdown copied to clipboard!');
                    }}
                    className="text-xs text-gray-400 hover:text-white transition"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {markdown}
                </pre>
              </div>
            )}

            {/* JSON Output */}
            {showJson && (
              <div className="mt-4 bg-gray-900 rounded-xl p-4 overflow-auto max-h-96">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-green-400 font-semibold">JSON</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(content, null, 2));
                      alert('JSON copied to clipboard!');
                    }}
                    className="text-xs text-gray-400 hover:text-white transition"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(content, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar - Usage Guide */}
          <div className="lg:col-span-1 space-y-4">
            {/* Slash Commands */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-lg">/</span> Slash Commands
              </h3>
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { cmd: '/text', desc: 'Text' },
                    { cmd: '/h1', desc: 'Heading 1' },
                    { cmd: '/h2', desc: 'Heading 2' },
                    { cmd: '/h3', desc: 'Heading 3' },
                    { cmd: '/bullet', desc: 'Bullet List' },
                    { cmd: '/number', desc: 'Numbered' },
                    { cmd: '/task', desc: 'Task List' },
                    { cmd: '/quote', desc: 'Quote' },
                    { cmd: '/code', desc: 'Code Block' },
                    { cmd: '/divider', desc: 'Divider' },
                    { cmd: '/table', desc: 'Table' },
                    { cmd: '/image', desc: 'Image' },
                    { cmd: '/embed', desc: 'Embed' },
                    { cmd: '/callout', desc: 'Callout' },
                    { cmd: '/toggle', desc: 'Toggle' },
                    { cmd: '/bookmark', desc: 'Bookmark' },
                    { cmd: '/math', desc: 'Math (LaTeX)' },
                  ].map(({ cmd, desc }) => (
                    <div key={cmd} className="flex items-center gap-1">
                      <code className="bg-gray-100 px-1 rounded text-[10px] font-mono">{cmd}</code>
                      <span className="text-gray-500 truncate">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Keyboard Shortcuts</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  { keys: 'Ctrl+B', action: 'Bold' },
                  { keys: 'Ctrl+I', action: 'Italic' },
                  { keys: 'Ctrl+U', action: 'Underline' },
                  { keys: 'Ctrl+Shift+S', action: 'Strikethrough' },
                  { keys: 'Ctrl+E', action: 'Code' },
                  { keys: 'Ctrl+Shift+H', action: 'Highlight' },
                  { keys: 'Ctrl+Z', action: 'Undo' },
                  { keys: 'Ctrl+Shift+Z', action: 'Redo' },
                ].map(({ keys, action }) => (
                  <div key={keys} className="flex justify-between">
                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">{keys}</kbd>
                    <span className="text-gray-500">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Markdown Shortcuts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Markdown Shortcuts</h3>
              <div className="space-y-1.5 text-xs">
                {[
                  { md: '# ', result: 'Heading 1' },
                  { md: '## ', result: 'Heading 2' },
                  { md: '### ', result: 'Heading 3' },
                  { md: '- ', result: 'Bullet List' },
                  { md: '1. ', result: 'Numbered List' },
                  { md: '[] ', result: 'Task List' },
                  { md: '> ', result: 'Blockquote' },
                  { md: '``` ', result: 'Code Block' },
                  { md: '--- ', result: 'Divider' },
                ].map(({ md, result }) => (
                  <div key={md} className="flex justify-between">
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">{md}</code>
                    <span className="text-gray-500">{result}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Test Guide */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Feature Test Guide</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div>
                  <strong className="text-gray-800">Image:</strong>
                  <p>Drag & drop, paste, or /image. Click to resize/align.</p>
                </div>
                <div>
                  <strong className="text-gray-800">Table:</strong>
                  <p>Click inside table for row/column controls.</p>
                </div>
                <div>
                  <strong className="text-gray-800">Embed:</strong>
                  <p>YouTube, Vimeo, Twitter, CodePen, CodeSandbox URLs.</p>
                </div>
                <div>
                  <strong className="text-gray-800">Math:</strong>
                  <p>LaTeX syntax. Ctrl+Enter to save.</p>
                </div>
                <div>
                  <strong className="text-gray-800">Callout:</strong>
                  <p>Click emoji to change. 6 color options.</p>
                </div>
              </div>
            </div>

            {/* API Notice */}
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <h3 className="font-semibold text-amber-800 mb-2 text-sm">Image Upload API</h3>
              <p className="text-xs text-amber-700 mb-2">
                For server upload, start the backend:
              </p>
              <code className="block bg-amber-100 p-2 rounded text-[10px] text-amber-900 font-mono">
                cd apps/demoapi && pnpm start:dev
              </code>
              <p className="text-[10px] text-amber-600 mt-2">
                Without API, images use Base64 (local only).
              </p>
            </div>

            {/* Version Info */}
            <div className="text-center text-xs text-gray-400">
              <p>zm-editor v0.1.0</p>
              <p>Tiptap + React 19 + Next.js 15</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
