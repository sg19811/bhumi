// Phone helpers for the Agent Network (spec section 1.5 step 3).

// Normalize various Indian phone inputs to +91XXXXXXXXXX.
// Handles "9876543210", "+919876543210", "+91-9876543210", "91-9876543210", "09876543210".
export function normalizePhone(input: unknown): string {
  const d = String(input ?? "").replace(/\D/g, "");
  if (d.length === 10) return `+91${d}`;
  if (d.length === 12 && d.startsWith("91")) return `+${d}`;
  if (d.length === 11 && d.startsWith("0")) return `+91${d.slice(1)}`;
  return d ? `+${d}` : "";
}

// True when the input contains at least 10 digits (a plausible phone).
export function isValidPhone(input: unknown): boolean {
  return String(input ?? "").replace(/\D/g, "").length >= 10;
}

// Mask to +91-9XXX-XXX-321 style for display where the full number must be hidden.
export function maskPhone(input: unknown): string {
  const n = normalizePhone(input).replace("+91", "");
  if (n.length < 4) return "•••";
  return `+91-${n[0]}XXX-XXX-${n.slice(-3)}`;
}
