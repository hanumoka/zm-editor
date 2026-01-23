/**
 * SSRF (Server-Side Request Forgery) prevention utilities
 * @module @zm-editor/core/security
 */

import { SsrfCheckResult, SsrfBlockReason, CLOUD_METADATA_HOSTS } from './types';

/**
 * Parse an IP octet that may be in decimal, octal (0-prefix), or hex (0x-prefix)
 * Returns NaN if invalid
 */
function parseIpOctet(octet: string): number {
  if (!octet) return NaN;
  const trimmed = octet.trim();
  if (!trimmed) return NaN;

  // Hex notation (0x or 0X prefix)
  if (/^0x[0-9a-fA-F]+$/i.test(trimmed)) {
    return parseInt(trimmed, 16);
  }

  // Octal notation (0 prefix, but not just "0")
  if (/^0[0-7]+$/.test(trimmed)) {
    return parseInt(trimmed, 8);
  }

  // Decimal notation
  if (/^[0-9]+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  return NaN;
}

/**
 * Normalize an IP address string to standard decimal notation
 * Handles decimal, octal, hex notations and single-number format
 * Returns null if invalid
 */
function normalizeIPv4(ip: string): [number, number, number, number] | null {
  // Handle IPv6 localhost variants first
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::' || lower === '0:0:0:0:0:0:0:1' || lower === '[::1]') {
    return [127, 0, 0, 1];
  }

  // Handle IPv6-mapped IPv4 (::ffff:127.0.0.1 or ::ffff:7f00:0001)
  const ipv4MappedMatch = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (ipv4MappedMatch) {
    return normalizeIPv4(ipv4MappedMatch[1]);
  }

  // Handle single decimal number (e.g., 2130706433 = 127.0.0.1)
  if (/^[0-9]+$/.test(ip)) {
    const num = parseInt(ip, 10);
    if (num >= 0 && num <= 0xffffffff) {
      return [
        (num >> 24) & 0xff,
        (num >> 16) & 0xff,
        (num >> 8) & 0xff,
        num & 0xff,
      ];
    }
    return null;
  }

  // Handle single hex number (e.g., 0x7f000001 = 127.0.0.1)
  if (/^0x[0-9a-fA-F]+$/i.test(ip)) {
    const num = parseInt(ip, 16);
    if (num >= 0 && num <= 0xffffffff) {
      return [
        (num >> 24) & 0xff,
        (num >> 16) & 0xff,
        (num >> 8) & 0xff,
        num & 0xff,
      ];
    }
    return null;
  }

  // Standard dotted notation (may contain octal/hex octets)
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return null;
  }

  const octets = parts.map(parseIpOctet);
  if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
    return null;
  }

  return octets as [number, number, number, number];
}

/**
 * Check if an IP address is a private/internal IP
 * Handles various IP notations: decimal, octal, hex, dotted, and single-number
 * Blocks:
 * - 10.0.0.0/8 (Class A private)
 * - 172.16.0.0/12 (Class B private)
 * - 192.168.0.0/16 (Class C private)
 * - 127.0.0.0/8 (Loopback)
 * - 0.0.0.0/8 (Current network)
 */
export function isPrivateIP(ip: string): boolean {
  const normalized = normalizeIPv4(ip);
  if (!normalized) {
    return false; // Not a valid IPv4, let other checks handle it
  }

  const [a, b] = normalized;

  // 10.0.0.0/8
  if (a === 10) return true;

  // 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;

  // 127.0.0.0/8 (loopback)
  if (a === 127) return true;

  // 0.0.0.0/8
  if (a === 0) return true;

  return false;
}

/**
 * Check if an IP address is a link-local address
 * 169.254.0.0/16 (APIPA)
 * Handles various IP notations
 */
export function isLinkLocalIP(ip: string): boolean {
  const normalized = normalizeIPv4(ip);
  if (!normalized) return false;
  return normalized[0] === 169 && normalized[1] === 254;
}

/**
 * Check if a hostname is localhost or a loopback variant
 */
export function isLocalhost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return (
    lower === 'localhost' ||
    lower === 'localhost.localdomain' ||
    lower.endsWith('.localhost') ||
    lower === '127.0.0.1' ||
    lower === '::1' ||
    lower === '[::1]'
  );
}

/**
 * Check if a hostname is a cloud metadata endpoint
 */
export function isCloudMetadataHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return CLOUD_METADATA_HOSTS.some(
    (metaHost) => lower === metaHost || lower === `[${metaHost}]`
  );
}

/**
 * Perform SSRF safety check on a URL
 * Returns whether the URL is safe to request from a server context
 */
export function checkSsrf(url: string): SsrfCheckResult {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // Check localhost
    if (isLocalhost(hostname)) {
      return { isSafe: false, reason: 'LOCALHOST' };
    }

    // Check cloud metadata endpoints
    if (isCloudMetadataHost(hostname)) {
      return { isSafe: false, reason: 'CLOUD_METADATA' };
    }

    // Check link-local (169.254.x.x)
    if (isLinkLocalIP(hostname)) {
      return { isSafe: false, reason: 'LINK_LOCAL' };
    }

    // Check private IPs
    if (isPrivateIP(hostname)) {
      return { isSafe: false, reason: 'PRIVATE_IP' };
    }

    return { isSafe: true };
  } catch {
    // Invalid URL, but not necessarily SSRF - let URL validator handle this
    return { isSafe: true };
  }
}

/**
 * Get human-readable message for SSRF block reason
 */
export function getSsrfBlockMessage(reason: SsrfBlockReason): string {
  switch (reason) {
    case 'PRIVATE_IP':
      return 'Private IP addresses are not allowed';
    case 'LOCALHOST':
      return 'Localhost URLs are not allowed';
    case 'CLOUD_METADATA':
      return 'Cloud metadata endpoints are not allowed';
    case 'LINK_LOCAL':
      return 'Link-local addresses are not allowed';
    default:
      return 'URL is blocked for security reasons';
  }
}
