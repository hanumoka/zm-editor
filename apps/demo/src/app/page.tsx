'use client';

import { useState, useRef, useCallback } from 'react';
import { ZmEditor, type ZmEditorRef, type JSONContent, type ImageUploadHandler } from '@zm-editor/react';

// demoapi 서버 URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const initialContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to zm-editor' }],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'A Notion-like rich text editor for React and Next.js.',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Features' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: "Slash commands - Type '/' to see options" },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Bubble menu - Select text to format' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Markdown shortcuts - # for headings, - for lists' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Try editing this content!' },
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

  // 이미지 업로드 핸들러 (demoapi 연동, 진행률 지원)
  const handleImageUpload: ImageUploadHandler = useCallback(async ({ file, onProgress }) => {
    setUploadStatus(`Uploading ${file.name}...`);
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // 업로드 진행률 이벤트
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
          onProgress?.(percent);
        }
      });

      // 업로드 완료
      xhr.addEventListener('load', () => {
        setIsUploading(false);

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setUploadStatus(`Uploaded: ${file.name}`);
          setUploadProgress(100);

          // 3초 후 상태 메시지 제거
          setTimeout(() => {
            setUploadStatus('');
            setUploadProgress(0);
          }, 3000);

          resolve({
            url: data.url,
            alt: file.name,
          });
        } else {
          const error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: 'Upload failed' };
          setUploadStatus(`Failed: ${error.message || 'Unknown error'}`);
          reject(new Error(error.message || 'Upload failed'));
        }
      });

      // 업로드 에러
      xhr.addEventListener('error', () => {
        setIsUploading(false);
        setUploadStatus('Failed: Network error');
        reject(new Error('Network error'));
      });

      xhr.open('POST', `${API_URL}/upload/image`);
      xhr.send(formData);
    });
  }, []);

  // 이미지 업로드 에러 핸들러
  const handleImageUploadError = useCallback((error: Error, file: File) => {
    console.error('Image upload error:', error, file);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatus(`Error: ${error.message}`);
    setTimeout(() => setUploadStatus(''), 5000);
  }, []);

  const handleExport = () => {
    const json = editorRef.current?.getJSON();
    if (json) {
      console.log('Editor content:', json);
      alert('Content exported to console');
    }
  };

  const handleClear = () => {
    editorRef.current?.clear();
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">zm-editor Demo</h1>
          <p className="text-gray-600 mt-2">
            Notion-like rich text editor for React/Next.js
          </p>
        </header>

        <div className="mb-4 flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Export JSON
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>

        {/* 업로드 상태 표시 (프로그레스 바 포함) */}
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

        <ZmEditor
          ref={editorRef}
          initialContent={content}
          onChange={setContent}
          placeholder="Type '/' for commands..."
          enableSlashCommand={true}
          enableBubbleMenu={true}
          onImageUpload={handleImageUpload}
          onImageUploadError={handleImageUploadError}
        />

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How to use</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Type <code className="bg-gray-200 px-1 rounded">/</code> to open slash command menu</li>
            <li>Select text to see bubble menu for formatting</li>
            <li>Use markdown shortcuts: <code className="bg-gray-200 px-1 rounded">#</code>, <code className="bg-gray-200 px-1 rounded">##</code>, <code className="bg-gray-200 px-1 rounded">-</code>, <code className="bg-gray-200 px-1 rounded">1.</code></li>
            <li>Press <code className="bg-gray-200 px-1 rounded">Ctrl+B</code> for bold, <code className="bg-gray-200 px-1 rounded">Ctrl+I</code> for italic</li>
            <li><strong>Image upload:</strong> Drag & drop, paste, or type <code className="bg-gray-200 px-1 rounded">/image</code></li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-yellow-800">Backend API Required</h2>
          <p className="text-sm text-yellow-700 mb-2">
            For image upload to work, start the demoapi server:
          </p>
          <code className="block bg-yellow-100 p-2 rounded text-sm text-yellow-900">
            cd apps/demoapi && pnpm start:dev
          </code>
          <p className="text-xs text-yellow-600 mt-2">
            API runs on http://localhost:4000
          </p>
        </div>
      </div>
    </main>
  );
}
