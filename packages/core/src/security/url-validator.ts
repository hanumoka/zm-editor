/**
 * URL validation utilities for security
 * @module @zm-editor/core/security
 */

import {
  UrlValidationResult,
  UrlValidationErrorCode,
  ImageUrlOptions,
  LinkUrlOptions,
  DANGEROUS_PROTOCOLS,
} from './types';
import { checkSsrf, getSsrfBlockMessage } from './ssrf-guard';

/**
 * Control characters and whitespace that should be stripped from URLs
 * These can be used to bypass URL validation
 * Includes: null, tab, newline, carriage return, and other ASCII control chars
 */
const URL_CONTROL_CHARS_REGEX = /[\x00-\x1f\x7f]/g;

/**
 * Sanitize a URL by removing dangerous control characters
 * This prevents bypass attempts using tabs, newlines, null bytes, etc.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  // Remove control characters that could be used to bypass validation
  return url.replace(URL_CONTROL_CHARS_REGEX, '').trim();
}

/**
 * Normalize a URL by adding https:// if no protocol is specified
 * Also sanitizes the URL by removing control characters
 */
export function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // First sanitize to remove control characters
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    return '';
  }

  // Already has a protocol
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(sanitized)) {
    return sanitized;
  }

  // Add https:// by default
  return `https://${sanitized}`;
}

/**
 * Check if a URL uses a dangerous protocol (javascript:, vbscript:, etc.)
 * Sanitizes the URL first to prevent bypass via control characters
 */
export function hasDangerousProtocol(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Sanitize first to remove control characters that could bypass validation
  const sanitized = sanitizeUrl(url).toLowerCase();
  return DANGEROUS_PROTOCOLS.some((proto) => sanitized.startsWith(proto));
}

/**
 * Validate a URL for use in links (href attributes)
 * Blocks: javascript:, vbscript:, data:, file:
 * Allows: http:, https:, mailto:, tel:
 * Sanitizes URLs to prevent bypass via control characters
 */
export function isSafeLinkUrl(url: string, options: LinkUrlOptions = {}): boolean {
  const { allowMailto = true, allowTel = true } = options;

  if (!url || typeof url !== 'string') {
    return false;
  }

  // Sanitize URL first to remove control characters
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    return false;
  }

  // Check for dangerous protocols (also sanitizes internally)
  if (hasDangerousProtocol(sanitized)) {
    return false;
  }

  try {
    const parsed = new URL(sanitized);
    const protocol = parsed.protocol.toLowerCase();

    // Allow safe protocols
    if (protocol === 'http:' || protocol === 'https:') {
      return true;
    }

    if (allowMailto && protocol === 'mailto:') {
      return true;
    }

    if (allowTel && protocol === 'tel:') {
      return true;
    }

    return false;
  } catch {
    // If URL parsing fails, it might be a relative URL
    // Check it doesn't start with dangerous protocols (already sanitized)
    const lower = sanitized.toLowerCase();
    return !DANGEROUS_PROTOCOLS.some((proto) => lower.startsWith(proto));
  }
}

/**
 * Validate a URL for use in images with detailed result
 * Includes SSRF protection
 * Sanitizes URLs to prevent bypass via control characters
 */
export function isSafeImageUrl(
  url: string,
  options: ImageUrlOptions = {}
): UrlValidationResult {
  const {
    allowDataUrls = true,
    allowBlobUrls = true,
    blockPrivateIPs = true,
    blockLocalhost = true,
    blockCloudMetadata = true,
  } = options;

  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'URL is required',
    };
  }

  // Sanitize URL first to remove control characters
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'URL is required',
    };
  }

  // Check for dangerous protocols (javascript:, vbscript:)
  const lower = sanitized.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
    return {
      isValid: false,
      errorCode: 'DANGEROUS_PROTOCOL',
      errorMessage: 'Dangerous protocol is not allowed',
    };
  }

  // Handle data: URLs
  if (lower.startsWith('data:')) {
    if (!allowDataUrls) {
      return {
        isValid: false,
        errorCode: 'DATA_URL_NOT_ALLOWED',
        errorMessage: 'Data URLs are not allowed',
      };
    }
    // Validate it's an image data URL
    if (lower.startsWith('data:image/')) {
      return { isValid: true, normalizedUrl: sanitized };
    }
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'Invalid image data URL',
    };
  }

  // Handle blob: URLs
  if (lower.startsWith('blob:')) {
    if (!allowBlobUrls) {
      return {
        isValid: false,
        errorCode: 'BLOB_URL_NOT_ALLOWED',
        errorMessage: 'Blob URLs are not allowed',
      };
    }
    return { isValid: true, normalizedUrl: sanitized };
  }

  // Parse and validate http/https URLs
  try {
    const parsed = new URL(sanitized);
    const protocol = parsed.protocol.toLowerCase();

    // Only allow http and https for remote images
    if (protocol !== 'http:' && protocol !== 'https:') {
      return {
        isValid: false,
        errorCode: 'DANGEROUS_PROTOCOL',
        errorMessage: `Protocol "${protocol}" is not allowed`,
      };
    }

    // SSRF checks
    if (blockLocalhost || blockPrivateIPs || blockCloudMetadata) {
      const ssrfResult = checkSsrf(sanitized);
      if (!ssrfResult.isSafe && ssrfResult.reason) {
        // Check if we should block based on options
        const shouldBlock =
          (ssrfResult.reason === 'LOCALHOST' && blockLocalhost) ||
          (ssrfResult.reason === 'PRIVATE_IP' && blockPrivateIPs) ||
          (ssrfResult.reason === 'CLOUD_METADATA' && blockCloudMetadata) ||
          (ssrfResult.reason === 'LINK_LOCAL' && blockPrivateIPs);

        if (shouldBlock) {
          const errorCode: UrlValidationErrorCode =
            ssrfResult.reason === 'LOCALHOST'
              ? 'LOCALHOST'
              : ssrfResult.reason === 'CLOUD_METADATA'
                ? 'CLOUD_METADATA'
                : 'PRIVATE_IP';

          return {
            isValid: false,
            errorCode,
            errorMessage: getSsrfBlockMessage(ssrfResult.reason),
          };
        }
      }
    }

    return { isValid: true, normalizedUrl: sanitized };
  } catch {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'Invalid URL format',
    };
  }
}

/**
 * Get a safe href value or empty string if unsafe
 * Use this when rendering href attributes to prevent XSS
 */
export function getSafeHref(url: string): string {
  return isSafeLinkUrl(url) ? url : '';
}

/**
 * Validate link URL with detailed result
 * Sanitizes URLs to prevent bypass via control characters
 */
export function validateLinkUrl(
  url: string,
  options: LinkUrlOptions = {}
): UrlValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'URL is required',
    };
  }

  // Sanitize URL first to remove control characters
  const sanitized = sanitizeUrl(url);
  if (!sanitized) {
    return {
      isValid: false,
      errorCode: 'INVALID_URL',
      errorMessage: 'URL is required',
    };
  }

  if (hasDangerousProtocol(sanitized)) {
    return {
      isValid: false,
      errorCode: 'DANGEROUS_PROTOCOL',
      errorMessage: 'This URL protocol is not allowed for security reasons',
    };
  }

  if (isSafeLinkUrl(sanitized, options)) {
    return { isValid: true, normalizedUrl: sanitized };
  }

  return {
    isValid: false,
    errorCode: 'INVALID_URL',
    errorMessage: 'Invalid URL format',
  };
}
