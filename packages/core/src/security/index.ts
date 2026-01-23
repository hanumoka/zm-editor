/**
 * Security module for zm-editor
 *
 * Provides URL validation, SSRF prevention, and other security utilities.
 *
 * @example
 * ```typescript
 * import { isSafeLinkUrl, isSafeImageUrl, normalizeUrl } from '@zm-editor/core';
 *
 * // Validate link URLs (blocks javascript:, vbscript:, etc.)
 * if (isSafeLinkUrl(userInput)) {
 *   editor.setLink({ href: userInput });
 * }
 *
 * // Validate image URLs with SSRF protection
 * const result = isSafeImageUrl(imageUrl, { blockPrivateIPs: true });
 * if (result.isValid) {
 *   editor.setImage({ src: imageUrl });
 * }
 * ```
 *
 * @module @zm-editor/core/security
 */

// Types
export type {
  UrlValidationResult,
  UrlValidationErrorCode,
  ImageUrlOptions,
  LinkUrlOptions,
  SsrfCheckResult,
  SsrfBlockReason,
} from './types';

export {
  DANGEROUS_PROTOCOLS,
  SAFE_LINK_PROTOCOLS,
  SAFE_IMAGE_PROTOCOLS,
  CLOUD_METADATA_HOSTS,
} from './types';

// URL validation
export {
  sanitizeUrl,
  normalizeUrl,
  hasDangerousProtocol,
  isSafeLinkUrl,
  isSafeImageUrl,
  getSafeHref,
  validateLinkUrl,
} from './url-validator';

// SSRF prevention
export {
  isPrivateIP,
  isLinkLocalIP,
  isLocalhost,
  isCloudMetadataHost,
  checkSsrf,
  getSsrfBlockMessage,
} from './ssrf-guard';
