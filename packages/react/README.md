# @zm-editor/react

React components for zm-editor - a Notion-style rich text editor built on [Tiptap](https://tiptap.dev).

[![npm version](https://img.shields.io/npm/v/@zm-editor/react.svg)](https://www.npmjs.com/package/@zm-editor/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Notion-like UX** - Slash commands, bubble menu, drag & drop blocks
- **35+ Slash Commands** - Headings, lists, code blocks, tables, and more
- **28+ Custom Blocks** - Images, embeds, callouts, diagrams, API blocks, etc.
- **Syntax Highlighting** - 26+ languages with GitHub Dark theme
- **Mermaid Diagrams** - Flowcharts, sequence diagrams, mindmaps
- **Math Equations** - KaTeX LaTeX rendering
- **i18n Support** - English & Korean built-in
- **Dark Mode** - Full dark mode support
- **TypeScript** - Full type definitions included

## Installation

```bash
npm install @zm-editor/core @zm-editor/react
```

### Peer Dependencies

```bash
npm install react react-dom
```

### Optional Dependencies

```bash
# For PDF preview in file attachments
npm install pdfjs-dist

# For HTML sanitization
npm install dompurify
```

## Quick Start

```tsx
'use client'; // Required for Next.js App Router

import { ZmEditor } from '@zm-editor/react';

export default function MyEditor() {
  return (
    <ZmEditor
      initialContent="<p>Hello, world!</p>"
      onChange={(editor) => {
        console.log(editor.getJSON());
      }}
    />
  );
}
```

## Usage with Next.js

For Next.js App Router, use dynamic import to avoid SSR issues:

```tsx
'use client';

import dynamic from 'next/dynamic';

const ZmEditor = dynamic(
  () => import('@zm-editor/react').then((mod) => mod.ZmEditor),
  { ssr: false }
);

export default function EditorWrapper() {
  return <ZmEditor />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string \| JSONContent` | `''` | Initial editor content (HTML or JSON) |
| `onChange` | `(editor: Editor) => void` | - | Callback when content changes |
| `onImageUpload` | `(file: File) => Promise<string>` | - | Custom image upload handler |
| `locale` | `ZmEditorLocale` | `enLocale` | Locale for i18n |
| `editable` | `boolean` | `true` | Enable/disable editing |
| `placeholder` | `string` | - | Placeholder text |
| `className` | `string` | - | Additional CSS class |

## Slash Commands

Type `/` to open the command menu:

| Command | Description |
|---------|-------------|
| `/text` | Plain text paragraph |
| `/h1`, `/h2`, `/h3` | Headings |
| `/bullet` | Bullet list |
| `/number` | Numbered list |
| `/task` | Task list (checklist) |
| `/quote` | Blockquote |
| `/code` | Code block with syntax highlighting |
| `/table` | Table (3x3) |
| `/image` | Image upload |
| `/file` | File attachment |
| `/embed` | Embed (YouTube, CodeSandbox, StackBlitz, Replit) |
| `/callout` | Callout box (info, warning, error, success, tip, note) |
| `/toggle` | Toggle (collapsible content) |
| `/mermaid` | Mermaid diagram |
| `/math` | Math equation (LaTeX) |
| `/terminal` | Terminal block |
| `/api` | API request/response block |
| `/divider` | Horizontal rule |
| `/toc` | Table of contents |
| `/error` | Error/warning/info message |
| `/os` | OS-specific commands (macOS/Linux/Windows) |
| `/changelog` | Version changelog |
| `/env` | Environment variables (with masking) |
| `/gist` | GitHub Gist embed |
| `/diff` | Code diff block |
| `/footnote` | Footnote |
| `/log` | Log block (debug/info/warn/error) |
| `/stacktrace` | Stack trace block |
| `/metadata` | Document metadata |
| `/graphql` | GraphQL query block |
| `/openapi` | OpenAPI/Swagger embed |
| `/diagram` | PlantUML/D2 diagram |
| `/emoji` | Emoji picker |

## Internationalization (i18n)

```tsx
import { ZmEditor, koLocale, enLocale } from '@zm-editor/react';

// Korean
<ZmEditor locale={koLocale} />

// English (default)
<ZmEditor locale={enLocale} />

// Custom locale
<ZmEditor
  locale={{
    ...enLocale,
    editor: {
      placeholder: 'Start writing...',
    },
  }}
/>
```

## Custom Image Upload

```tsx
<ZmEditor
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const { url } = await response.json();
    return url;
  }}
/>
```

## Export Content

```tsx
import { useRef } from 'react';
import { ZmEditor, type ZmEditorRef } from '@zm-editor/react';

function MyEditor() {
  const editorRef = useRef<ZmEditorRef>(null);

  const handleExport = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    const json = editor.getJSON();
    const html = editor.getHTML();
    const text = editor.getText();
  };

  return (
    <>
      <ZmEditor ref={editorRef} />
      <button onClick={handleExport}>Export</button>
    </>
  );
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Requirements

- React 18+
- Node.js 18+

## Related Packages

| Package | Description |
|---------|-------------|
| [@zm-editor/core](https://www.npmjs.com/package/@zm-editor/core) | Core Tiptap extensions and utilities |

## Links

- [GitHub Repository](https://github.com/hanumoka/zm-editor)
- [Documentation](https://github.com/hanumoka/zm-editor#readme)

## License

[MIT](https://github.com/hanumoka/zm-editor/blob/main/LICENSE)
