// Referral codes + attribution. SERVER-ONLY (service-role; bypasses RLS).
// See growth-engine-spec-aggressive-v2.md §2.4.

import { randomBytes } from "crypto";
import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import type { ReferralType, ReferralEventType } from "./growth-types";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // uppercase, no ambiguous chars

/** A short, readable, hard-to-guess referral code. */
export function generateReferralCode(length = 8): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * Get-or-create a stable referral code for a user. Idempotent — returns the
 * existing code if one exists, else inserts a new unique one. Null on failure.
 */
export async function ensureReferralCode(userId: string, referralType: ReferralType = "buyer"): Promise<string | null> {
  if (!userId) return null;
  const { data: existing } = await db
    .from("referral_codes")
    .select("code")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (existing?.code) return existing.code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    const { data, error } = await db
      .from("referral_codes")
      .insert({ code, user_id: userId, referral_type: referralType })
      .select("code")
      .maybeSingle();
    if (!error && data) return data.code;
    if (error && error.code !== "23505") break; // non-collision error → stop
  }
  return null;
}

/** Resolve a referral code to its owner's user_id (active codes only). */
export async function resolveReferrerUserId(code: string): Promise<string | null> {
  if (!code) return null;
  const { data } = await db
    .from("referral_codes")
    .select("user_id, status")
    .eq("code", code)
    .maybeSingle();
  return data && data.status === "active" ? data.user_id : null;
}

export interface ReferralAttribution {
  referralCode?: string | null;
  referredUserId?: string | null;
  eventType: ReferralEventType;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Record an attribution event for a referred action. Best-effort: returns
 * false (without throwing) when there's no code or the insert fails, so callers
 * can attribute without ever risking the core action.
 */
export async function recordReferralEvent(a: ReferralAttribution): Promise<boolean> {
  const code = a.referralCode?.trim();
  if (!code) return false;
  const referrerUserId = await resolveReferrerUserId(code);
  const { error } = await db.from("referral_events").insert({
    referral_code: code,
    referrer_user_id: referrerUserId,
    referred_user_id: a.referredUserId ?? null,
    event_type: a.eventType,
    entity_type: a.entityType ?? null,
    entity_id: a.entityId ?? null,
    metadata: a.metadata ?? {},
  });
  return !error;
}
