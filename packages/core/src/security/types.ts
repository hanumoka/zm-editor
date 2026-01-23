/**
 * Security module types for zm-editor
 * @module @zm-editor/core/security
 */

/**
 * URL validation result
 */
export interface UrlValidationResult {
  /** Whether the URL is valid and safe */
  isValid: boolean;
  /** Error code if validation failed */
  errorCode?: UrlValidationErrorCode;
  /** Human-readable error message */
  errorMessage?: string;
  /** Normalized URL if valid */
  normalizedUrl?: string;
}

/**
 * URL validation error codes
 */
export type UrlValidationErrorCode =
  | 'INVALID_URL'
  | 'DANGEROUS_PROTOCOL'
  | 'PRIVATE_IP'
  | 'LOCALHOST'
  | 'CLOUD_METADATA'
  | 'DATA_URL_NOT_ALLOWED'
  | 'BLOB_URL_NOT_ALLOWED';

/**
 * Options for image URL validation
 */
export interface ImageUrlOptions {
  /** Allow data: URLs (default: true for backward compatibility) */
  allowDataUrls?: boolean;
  /** Allow blob: URLs (default: true) */
  allowBlobUrls?: boolean;
  /** Block private IP addresses (default: true) */
  blockPrivateIPs?: boolean;
  /** Block localhost (default: true) */
  blockLocalhost?: boolean;
  /** Block cloud metadata endpoints (default: true) */
  blockCloudMetadata?: boolean;
}

/**
 * Options for link URL validation
 */
export interface LinkUrlOptions {
  /** Allow mailto: URLs (default: true) */
  allowMailto?: boolean;
  /** Allow tel: URLs (default: true) */
  allowTel?: boolean;
}

/**
 * SSRF check result
 */
export interface SsrfCheckResult {
  /** Whether the URL is safe from SSRF */
  isSafe: boolean;
  /** Reason if blocked */
  reason?: SsrfBlockReason;
}

/**
 * SSRF block reasons
 */
export type SsrfBlockReason =
  | 'PRIVATE_IP'
  | 'LOCALHOST'
  | 'CLOUD_METADATA'
  | 'LINK_LOCAL';

/**
 * List of dangerous URL protocols that should be blocked
 */
export const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'vbscript:',
  'data:',
  'file:',
] as const;

/**
 * List of safe URL protocols for links
 */
export const SAFE_LINK_PROTOCOLS = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
] as const;

/**
 * List of safe URL protocols for images
 */
export const SAFE_IMAGE_PROTOCOLS = [
  'http:',
  'https:',
  'data:',
  'blob:',
] as const;

/**
 * Cloud metadata endpoints that should be blocked (SSRF prevention)
 */
export const CLOUD_METADATA_HOSTS = [
  '169.254.169.254', // AWS, GCP, Azure
  'metadata.google.internal',
  'metadata.gcp.internal',
  '100.100.100.200', // Alibaba Cloud
] as const;
