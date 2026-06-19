// Share-link helpers — pure code generation + URL shape. The DB write lives
// in the API route (app/api/growth/share-link/route.ts, Phase 1.3) so this
// file stays dependency-free and testable. See growth-engine-spec §5.1 (v1).

import { randomBytes } from "crypto";

const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/l/I

/**
 * A short, URL-safe, hard-to-guess code for /go/[shortCode].
 * Default 7 chars from a 54-symbol alphabet ≈ 10^12 space — ample for our scale.
 */
export function generateShortCode(length = 7): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

/** Canonical public URL for a tracked short link. */
export function shortLinkUrl(origin: string, shortCode: string): string {
  return `${origin.replace(/\/$/, "")}/go/${shortCode}`;
}
