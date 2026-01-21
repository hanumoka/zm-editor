'use client';

import { useState, useRef } from 'react';
import { ZmEditor, type ZmEditorRef, type JSONContent } from '@zm-editor/react';

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

        <ZmEditor
          ref={editorRef}
          initialContent={content}
          onChange={setContent}
          placeholder="Type '/' for commands..."
          enableSlashCommand={true}
          enableBubbleMenu={true}
        />

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How to use</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Type <code className="bg-gray-200 px-1 rounded">/</code> to open slash command menu</li>
            <li>Select text to see bubble menu for formatting</li>
            <li>Use markdown shortcuts: <code className="bg-gray-200 px-1 rounded">#</code>, <code className="bg-gray-200 px-1 rounded">##</code>, <code className="bg-gray-200 px-1 rounded">-</code>, <code className="bg-gray-200 px-1 rounded">1.</code></li>
            <li>Press <code className="bg-gray-200 px-1 rounded">Ctrl+B</code> for bold, <code className="bg-gray-200 px-1 rounded">Ctrl+I</code> for italic</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
