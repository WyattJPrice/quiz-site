import { createHash } from 'node:crypto';

/**
 * Stable UUIDv5-style identifier derived from a namespace and key parts.
 * The seed script uses these so re-running the import upserts the same rows
 * instead of duplicating them. This must stay server/script-only.
 */
export function deterministicUuid(...parts: string[]): string {
  const hash = createHash('sha1')
    .update(['study-wyattprice', ...parts].join(':'))
    .digest();

  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}
