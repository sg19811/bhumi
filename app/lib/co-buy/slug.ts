// Slug helper for co-buy opportunities: lowercase, dash-separated, max 80 chars,
// fallback to the opportunity id when the title yields nothing usable.

export function coBuySlug(title: string, fallbackId?: string): string {
  const base = (title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");
  if (base) return base;
  return fallbackId ? `opportunity-${fallbackId.slice(0, 8)}` : "opportunity";
}
