import type { Amenity } from "@/app/lib/farm-plots/types";

// Canonical amenity catalog. `key` is what's stored in listings.amenities (jsonb
// string array). `icon` is the Lucide name (data only — no icon lib is installed
// yet); `emoji` is the lightweight visual AmenitiesGrid renders today.
export const AMENITIES: Amenity[] = [
  { key: "internal_roads", label: "Internal roads", icon: "route", emoji: "🛣️" },
  { key: "fencing", label: "Fencing", icon: "fence", emoji: "🚧" },
  { key: "gated_entry", label: "Gated entry", icon: "door-closed", emoji: "🚪" },
  { key: "security", label: "24×7 security", icon: "shield-check", emoji: "🛡️" },
  { key: "water_supply", label: "Water supply / borewell", icon: "droplets", emoji: "💧" },
  { key: "electricity", label: "Electricity", icon: "zap", emoji: "⚡" },
  { key: "drip_irrigation", label: "Drip irrigation", icon: "sprout", emoji: "🌱" },
  { key: "plantation", label: "Plantation", icon: "trees", emoji: "🌳" },
  { key: "farm_management", label: "Farm management", icon: "tractor", emoji: "🚜" },
  { key: "clubhouse", label: "Clubhouse", icon: "home", emoji: "🏡" },
  { key: "landscaping", label: "Landscaping", icon: "flower-2", emoji: "🌿" },
  { key: "caretaker", label: "Caretaker", icon: "user-round", emoji: "🧑‍🌾" },
];

const BY_KEY = new Map(AMENITIES.map((a) => [a.key, a]));

export function amenity(key: string): Amenity {
  return BY_KEY.get(key) ?? { key, label: key.replace(/_/g, " "), icon: "check", emoji: "✓" };
}
