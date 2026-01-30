# @zm-editor/core

Core Tiptap extensions and utilities for zm-editor - a Notion-style rich text editor.

[![npm version](https://img.shields.io/npm/v/@zm-editor/core.svg)](https://www.npmjs.com/package/@zm-editor/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**English** | [한국어](./README.ko.md)

## Installation

```bash
npm install @zm-editor/core
```

> **Note**: This package is typically used together with `@zm-editor/react`. For most use cases, install both:
> ```bash
> npm install @zm-editor/core @zm-editor/react
> ```

## What's Included

### Tiptap Extensions

- **StarterKit** - Pre-configured Tiptap starter kit with common extensions
- **SlashCommand** - Notion-style slash command menu
- **Mention** - @ mention support
- **CodeBlockLowlight** - Syntax highlighting for 26+ languages
- **Table** - Table support with cell merging and background colors
- **Image** - Enhanced image extension with resize and alignment
- **Custom Nodes** - 28+ custom node extensions (Callout, Toggle, Embed, Mermaid, etc.)

### Security Utilities

```typescript
import {
  isSafeLinkUrl,
  isSafeImageUrl,
  sanitizeUrl,
  checkSsrf,
  isPrivateIP,
} from '@zm-editor/core';

// Validate URLs
isSafeLinkUrl('https://example.com'); // true
isSafeLinkUrl('javascript:alert(1)'); // false

// SSRF protection
checkSsrf('http://192.168.1.1'); // { safe: false, reason: 'Private IP' }
checkSsrf('https://example.com'); // { safe: true }
```

### i18n Types

```typescript
import type { ZmEditorLocale } from '@zm-editor/core';

const customLocale: ZmEditorLocale = {
  editor: {
    placeholder: 'Start writing...',
  },
  // ... other locale keys
};
```

## Usage with @zm-editor/react

```tsx
import { ZmEditor } from '@zm-editor/react';

export default function MyEditor() {
  return (
    <ZmEditor
      initialContent="<p>Hello, world!</p>"
      onChange={(editor) => console.log(editor.getJSON())}
    />
  );
}
```

## Peer Dependencies

- `@tiptap/core` ^2.11.0
- `@tiptap/pm` ^2.11.0

## Related Packages

| Package | Description |
|---------|-------------|
| [@zm-editor/react](https://www.npmjs.com/package/@zm-editor/react) | React components and hooks |

## Links

- [GitHub Repository](https://github.com/hanumoka/zm-editor)
- [Documentation](https://github.com/hanumoka/zm-editor#readme)

## License

[MIT](https://github.com/hanumoka/zm-editor/blob/main/LICENSE)
