// Saved listings for logged-out users, kept in localStorage (signed-in users use
// the saved_listings table instead).
const KEY = "bhumi:guest-saves";

export function getGuestSaves(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hasGuestSave(id: string): boolean {
  return getGuestSaves().includes(id);
}

export function toggleGuestSave(id: string): boolean {
  const cur = getGuestSaves();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next.includes(id);
}
