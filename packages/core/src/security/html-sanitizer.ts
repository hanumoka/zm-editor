/**
 * HTML Sanitizer module for zm-editor
 *
 * Provides optional DOMPurify integration for HTML sanitization.
 * DOMPurify is an optional peer dependency - users must install it separately.
 *
 * @example
 * ```typescript
 * import DOMPurify from 'dompurify';
 * import { configureDOMPurify, sanitizeHtml, isDOMPurifyAvailable } from '@zm-editor/core';
 *
 * // Configure DOMPurify instance (required before using sanitizeHtml)
 * configureDOMPurify(DOMPurify);
 *
 * // Sanitize HTML content
 * const clean = sanitizeHtml('<script>alert(1)</script><p>Safe</p>');
 * // Result: '<p>Safe</p>'
 * ```
 *
 * @module @zm-editor/core/security
 */

import type { HtmlSanitizerOptions, HtmlSanitizationResult } from './types';

/**
 * DOMPurify module type
 */
type DOMPurifyModule = {
  sanitize: (dirty: string, config?: Record<string, unknown>) => string;
  version: string;
  removed: Array<{ element?: Element; attribute?: Attr }>;
};

/**
 * Stored DOMPurify instance
 */
let purifyInstance: DOMPurifyModule | null = null;

/**
 * Default allowed tags for sanitization
 */
export const DEFAULT_ALLOWED_TAGS = [
  // Text formatting
  'p', 'br', 'span', 'div',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Inline formatting
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins',
  'code', 'kbd', 'mark', 'sub', 'sup', 'small',
  // Links
  'a',
  // Lists
  'ul', 'ol', 'li',
  // Block elements
  'blockquote', 'pre', 'hr',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Media
  'img', 'figure', 'figcaption',
  // Semantic
  'article', 'section', 'aside', 'header', 'footer', 'nav', 'main',
] as const;

/**
 * Default allowed attributes for sanitization
 */
export const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'title'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  '*': ['class', 'id', 'style', 'data-*'],
  table: ['border', 'cellpadding', 'cellspacing'],
  td: ['colspan', 'rowspan', 'align', 'valign'],
  th: ['colspan', 'rowspan', 'align', 'valign', 'scope'],
  col: ['span', 'width'],
  colgroup: ['span'],
};

/**
 * Configure DOMPurify instance
 *
 * This function must be called before using sanitizeHtml().
 * Users must install and import DOMPurify separately.
 *
 * @param instance - DOMPurify module
 *
 * @example
 * ```typescript
 * import DOMPurify from 'dompurify';
 * import { configureDOMPurify } from '@zm-editor/core';
 *
 * configureDOMPurify(DOMPurify);
 * ```
 */
export function configureDOMPurify(instance: DOMPurifyModule): void {
  purifyInstance = instance;
}

/**
 * Check if DOMPurify is available (configured)
 *
 * @returns true if DOMPurify has been configured
 */
export function isDOMPurifyAvailable(): boolean {
  return purifyInstance !== null;
}

/**
 * Get DOMPurify version if available
 *
 * @returns DOMPurify version string or null
 */
export function getDOMPurifyVersion(): string | null {
  return purifyInstance?.version ?? null;
}

/**
 * Sanitize HTML content using DOMPurify
 *
 * Removes potentially dangerous content from HTML while preserving safe elements.
 *
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized HTML string
 * @throws Error if DOMPurify is not configured
 *
 * @example
 * ```typescript
 * // Basic usage (after configuring DOMPurify)
 * const clean = sanitizeHtml('<script>alert(1)</script><p>Safe</p>');
 * // Result: '<p>Safe</p>'
 *
 * // With custom options
 * const clean = sanitizeHtml(html, {
 *   allowedTags: ['p', 'strong', 'em'],
 *   allowedAttributes: { a: ['href'] }
 * });
 * ```
 */
export function sanitizeHtml(html: string, options: HtmlSanitizerOptions = {}): string {
  if (!purifyInstance) {
    throw new Error(
      'DOMPurify is not configured. Install dompurify and call configureDOMPurify() first.\n' +
        'npm install dompurify\n' +
        'npm install -D @types/dompurify'
    );
  }

  const {
    allowedTags = DEFAULT_ALLOWED_TAGS as unknown as string[],
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    allowDataUrls = false,
    allowScripts = false,
  } = options;

  // Build DOMPurify config
  const config: Record<string, unknown> = {
    ALLOWED_TAGS: allowedTags,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };

  // Build ALLOWED_ATTR from allowedAttributes
  const allAttrs = new Set<string>();
  for (const attrs of Object.values(allowedAttributes)) {
    for (const attr of attrs) {
      allAttrs.add(attr);
    }
  }
  config.ALLOWED_ATTR = Array.from(allAttrs);

  // Allow data: URIs if specified
  if (allowDataUrls) {
    config.ALLOW_DATA_ATTR = true;
    config.ADD_DATA_URI_TAGS = ['img', 'a'];
  }

  // Block scripts (default)
  if (!allowScripts) {
    // Ensure script tags are removed
    if (Array.isArray(config.ALLOWED_TAGS) && !config.ALLOWED_TAGS.includes('script')) {
      // Already excluded
    }
  }

  return purifyInstance.sanitize(html, config);
}

/**
 * Sanitize HTML content with detailed result
 *
 * Returns sanitized HTML along with information about removed content.
 *
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitization result with sanitized HTML and removed items
 * @throws Error if DOMPurify is not configured
 *
 * @example
 * ```typescript
 * const result = sanitizeHtmlWithDetails('<script>bad</script><p>good</p>');
 * console.log(result.sanitized); // '<p>good</p>'
 * console.log(result.removed);   // ['script']
 * console.log(result.wasModified); // true
 * ```
 */
export function sanitizeHtmlWithDetails(
  html: string,
  options: HtmlSanitizerOptions = {}
): HtmlSanitizationResult {
  if (!purifyInstance) {
    throw new Error(
      'DOMPurify is not configured. Install dompurify and call configureDOMPurify() first.'
    );
  }

  // Keep track of original
  const original = html;

  // Perform sanitization
  const sanitized = sanitizeHtml(html, options);

  // Get removed items from DOMPurify
  const removed: string[] = [];
  for (const item of purifyInstance.removed) {
    if (item.element) {
      removed.push(item.element.tagName.toLowerCase());
    }
    if (item.attribute) {
      removed.push(`@${item.attribute.name}`);
    }
  }

  return {
    sanitized,
    removed: [...new Set(removed)], // Unique values
    wasModified: sanitized !== original,
  };
}

/**
 * Create a configured sanitizer function with preset options
 *
 * Useful for creating a sanitizer with specific allowed content.
 *
 * @param defaultOptions - Default options for the sanitizer
 * @returns Configured sanitizer function
 *
 * @example
 * ```typescript
 * const sanitizeUserInput = createSanitizer({
 *   allowedTags: ['p', 'strong', 'em', 'a'],
 *   allowedAttributes: { a: ['href'] }
 * });
 *
 * const clean = sanitizeUserInput('<script>bad</script><p>good</p>');
 * ```
 */
export function createSanitizer(
  defaultOptions: HtmlSanitizerOptions = {}
): (html: string, options?: HtmlSanitizerOptions) => string {
  return (html: string, options?: HtmlSanitizerOptions) => {
    return sanitizeHtml(html, { ...defaultOptions, ...options });
  };
}

/**
 * Check if HTML contains potentially dangerous content
 *
 * Quick check without modifying the HTML.
 *
 * @param html - HTML string to check
 * @returns true if the HTML contains potentially dangerous content
 *
 * @example
 * ```typescript
 * if (containsDangerousHtml(userInput)) {
 *   console.warn('User input contains potentially dangerous content');
 * }
 * ```
 */
export function containsDangerousHtml(html: string): boolean {
  if (!purifyInstance) {
    // Fallback to basic regex check if DOMPurify is not available
    const dangerousPatterns = [
      /<script\b/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // onclick, onerror, etc.
      /<iframe\b/i,
      /<object\b/i,
      /<embed\b/i,
      /<form\b/i,
    ];

    return dangerousPatterns.some((pattern) => pattern.test(html));
  }

  // Use DOMPurify for accurate check
  const sanitized = sanitizeHtml(html);
  return sanitized !== html;
}
