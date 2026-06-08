// Farm-plot transparency readout. This is NOT a legal verification or a quality
// score — it honestly reflects how much the developer has DISCLOSED about a
// project, and flags the things a buyer must independently check. Pairs with the
// general Trust Score (lib/trust.ts), which scores listing completeness/corroboration.

export type TransparencyStatus = "good" | "caution" | "missing";

export type TransparencyItem = {
  label: string;
  status: TransparencyStatus;
  detail: string;
};

const str = (listing: Record<string, unknown>, k: string) => {
  const v = listing?.[k];
  return v != null && v !== "" ? String(v) : null;
};
const num = (listing: Record<string, unknown>, k: string) => {
  const v = listing?.[k];
  return typeof v === "number" ? v : v != null && v !== "" ? Number(v) : null;
};

export function projectTransparency(listing: Record<string, unknown>): TransparencyItem[] {
  const items: TransparencyItem[] = [];

  // 1. Layout / planning approval
  const layout = str(listing, "layout_approval_status");
  items.push(
    layout === "approved"
      ? { label: "Layout approval", status: "good", detail: "Developer states the layout is approved — ask to see the sanction." }
      : layout === "not_required"
        ? { label: "Layout approval", status: "good", detail: "Marked not required — confirm why with the developer and a lawyer." }
        : layout === "pending"
          ? { label: "Layout approval", status: "caution", detail: "Approval is pending — don't assume it will come through. Verify before buying." }
          : { label: "Layout approval", status: "missing", detail: "Not stated. Ask the developer and check the sanction yourself." },
  );

  // 2. Land conversion (NA) status
  const conv = str(listing, "conversion_status");
  items.push(
    conv === "converted"
      ? { label: "Land conversion (NA)", status: "good", detail: "Stated as converted — verify the conversion order on record." }
      : conv === "agricultural"
        ? { label: "Land conversion (NA)", status: "caution", detail: "Still agricultural — building usually needs conversion plus plan approval." }
        : conv === "partial"
          ? { label: "Land conversion (NA)", status: "caution", detail: "Partially converted — confirm which survey numbers are converted." }
          : { label: "Land conversion (NA)", status: "missing", detail: "Not stated. Check the land classification on the revenue record." },
  );

  // 3. Plot inventory disclosed
  const plotCount = num(listing, "plot_count");
  items.push(
    plotCount && plotCount > 0
      ? { label: "Plot inventory", status: "good", detail: `${plotCount} plots disclosed. Check the live availability and sizes.` }
      : { label: "Plot inventory", status: "missing", detail: "Plot count not provided yet." },
  );

  // 4. Developer disclosed
  const dev = str(listing, "developer_name");
  items.push(
    dev
      ? { label: "Developer named", status: "good", detail: `${dev}. Verify their track record and registration independently.` }
      : { label: "Developer named", status: "missing", detail: "Developer not named. Ask who is behind the project." },
  );

  // 5. Map location pinned
  const lat = num(listing, "latitude");
  const lon = num(listing, "longitude");
  const hasGps = lat != null && lon != null && !(lat === 0 && lon === 0);
  items.push(
    hasGps
      ? { label: "Map location", status: "good", detail: "Pinned on the map — you can see exactly where it is." }
      : { label: "Map location", status: "missing", detail: "No GPS pin. Ask for the exact location and survey numbers." },
  );

  // 6. Photos
  const photos = Array.isArray(listing?.photos) ? (listing.photos as unknown[]).length : 0;
  items.push(
    photos > 0
      ? { label: "Photos", status: "good", detail: `${photos} photo${photos === 1 ? "" : "s"} provided. A site visit still matters.` }
      : { label: "Photos", status: "missing", detail: "No photos yet." },
  );

  // 7. Possession timeline
  const poss = str(listing, "possession_timeline");
  items.push(
    poss
      ? { label: "Possession timeline", status: "good", detail: "Timeline stated — get it in writing in the agreement." }
      : { label: "Possession timeline", status: "missing", detail: "Possession timeline not stated." },
  );

  return items;
}

/** Count of disclosed (good) items out of the total — for the summary line. */
export function transparencySummary(items: TransparencyItem[]): { disclosed: number; total: number } {
  return { disclosed: items.filter((i) => i.status === "good").length, total: items.length };
}
