// Compute the name shown to FELLOW members based on identity_visibility.
// Default is first-name + city. Phone numbers are never derived or exposed here.
import type { IdentityVisibility } from "./types";

export function displayMemberName(displayName: string, visibility?: IdentityVisibility | null, city?: string | null): string {
  const name = (displayName || "").trim();
  const first = name.split(/[\s,]+/)[0] || "Member";
  switch (visibility) {
    case "full_name":
      return name || "Member";
    case "masked":
      return `${first.charAt(0).toUpperCase()}.`;
    case "first_name_city":
    default:
      return city ? `${first}, ${city}` : first;
  }
}
