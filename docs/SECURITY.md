# Security Guide for zm-editor

This document describes the security measures implemented in zm-editor and provides guidance for secure integration.

## Overview

zm-editor implements multiple layers of security to protect against common web vulnerabilities:

- **XSS Prevention**: URL validation for links and images
- **SSRF Prevention**: Blocks requests to internal/private networks
- **Iframe Sandboxing**: Restricts embed capabilities
- **Protocol Validation**: Blocks dangerous URL schemes

---

## URL Validation

### URL Sanitization

All URLs are sanitized before validation to prevent bypass attacks:

- **Control characters removed**: null bytes, tabs, newlines, carriage returns (0x00-0x1F, 0x7F)
- This prevents attacks like `java\tscript:alert(1)` or `java\x00script:alert(1)`

### Link URLs (BubbleMenu)

When users add links via the bubble menu, zm-editor validates URLs to prevent XSS attacks.

**Blocked Protocols:**
- `javascript:` - Prevents script injection
- `vbscript:` - Prevents VBScript injection
- `data:` - Prevents data URI attacks
- `file:` - Prevents local file access

**Allowed Protocols:**
- `http:` / `https:` - Standard web URLs
- `mailto:` - Email links
- `tel:` - Phone links

### Image URLs

Image URLs undergo additional SSRF (Server-Side Request Forgery) validation:

**Blocked:**
- Private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
- Localhost (127.0.0.1, localhost)
- Link-local addresses (169.254.x.x)
- Cloud metadata endpoints (169.254.169.254)
- **Alternative IP notations** (decimal: 2130706433, hex: 0x7f000001, octal: 0177.0.0.1)
- IPv6 mapped IPv4 (::ffff:127.0.0.1)

**Allowed:**
- `http:` / `https:` - Remote images
- `data:image/*` - Base64 encoded images
- `blob:` - Local blob URLs

---

## Using Security Utilities

### In Your Application

```typescript
import {
  sanitizeUrl,
  isSafeLinkUrl,
  isSafeImageUrl,
  normalizeUrl,
  getSafeHref
} from '@zm-editor/core';

// Validate a link URL
if (isSafeLinkUrl(userUrl)) {
  // Safe to use
}

// Validate an image URL with SSRF protection
const result = isSafeImageUrl(imageUrl, {
  allowDataUrls: true,
  blockPrivateIPs: true,
});

if (result.isValid) {
  // Safe to render
} else {
  console.error(result.errorMessage);
}

// Normalize URLs (adds https:// if missing)
const url = normalizeUrl('example.com'); // https://example.com

// Get safe href or empty string
const href = getSafeHref(untrustedUrl);
```

### API Reference

#### `sanitizeUrl(url: string): string`

Removes dangerous control characters (null bytes, tabs, newlines, etc.) from URLs. Called automatically by other validation functions.

#### `isSafeLinkUrl(url: string, options?: LinkUrlOptions): boolean`

Validates URLs for use in anchor href attributes.

Options:
- `allowMailto?: boolean` - Allow mailto: links (default: true)
- `allowTel?: boolean` - Allow tel: links (default: true)

#### `isSafeImageUrl(url: string, options?: ImageUrlOptions): UrlValidationResult`

Validates image URLs with SSRF protection.

Options:
- `allowDataUrls?: boolean` - Allow data: URLs (default: true)
- `allowBlobUrls?: boolean` - Allow blob: URLs (default: true)
- `blockPrivateIPs?: boolean` - Block private IPs (default: true)
- `blockLocalhost?: boolean` - Block localhost (default: true)
- `blockCloudMetadata?: boolean` - Block cloud metadata (default: true)

Returns:
```typescript
interface UrlValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
  normalizedUrl?: string;
}
```

#### `normalizeUrl(url: string): string`

Sanitizes the URL and adds `https://` protocol if no protocol is specified.

#### `getSafeHref(url: string): string`

Returns the URL if safe, otherwise returns empty string.

---

## Embed Security (iframes)

Embedded content (YouTube, Vimeo, etc.) uses iframe sandboxing:

```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
  referrerPolicy="no-referrer-when-downgrade"
  ...
/>
```

**Sandbox Permissions:**
- `allow-scripts` - Required for video playback
- `allow-same-origin` - Required for embed functionality
- `allow-popups` - Allows opening links in new tabs
- `allow-presentation` - Allows fullscreen video

**Not Allowed (blocked by default):**
- `allow-forms` - Form submission
- `allow-modals` - Alert/confirm dialogs
- `allow-top-navigation` - Redirecting parent page
- Clipboard access (beyond clipboard-write via allow)
- Sensor access (geolocation, camera, etc.)

---

## Content Security Policy (CSP)

We recommend configuring CSP headers for your application:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  frame-src https://www.youtube.com https://player.vimeo.com https://codepen.io https://codesandbox.io;
  connect-src 'self' https:;
```

Adjust based on your specific requirements.

---

## File Upload Security

zm-editor provides client-side file handling, but **backend validation is essential**.

### Backend Checklist

1. **File Type Validation**
   - Verify MIME type from file headers (magic bytes)
   - Don't trust client-provided MIME type
   - Whitelist allowed extensions

2. **File Size Limits**
   - Set maximum file size limits
   - Implement rate limiting

3. **File Storage**
   - Store files outside web root
   - Use randomized file names
   - Scan files for malware

4. **Access Control**
   - Implement proper authentication
   - Validate user permissions

### Example Backend Validation (Node.js)

```javascript
const fileType = require('file-type');
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

async function validateUpload(file) {
  // Check size
  if (file.size > MAX_SIZE) {
    throw new Error('File too large');
  }

  // Check actual file type from content
  const type = await fileType.fromBuffer(file.buffer);
  if (!type || !ALLOWED_TYPES.includes(type.mime)) {
    throw new Error('Invalid file type');
  }

  return true;
}
```

---

## HTML Sanitization (Optional)

For additional protection, you can integrate DOMPurify:

```bash
npm install dompurify
npm install -D @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

// When importing HTML content
const cleanHtml = DOMPurify.sanitize(dirtyHtml, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
});
```

---

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email security concerns to the maintainers
3. Include detailed reproduction steps
4. Allow time for a fix before public disclosure

---

## Security Changelog

### Phase 9 (2026-01-23)

- Added URL validation to BubbleMenu link insertion
- Added SSRF protection for image URLs
- Added iframe sandbox to embed nodes
- Consolidated security utilities in `@zm-editor/core`
- Created security documentation

---

*Last updated: 2026-01-23*
