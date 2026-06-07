// Farm Plot Projects — shared types. Spec: docs/farm-plots-spec.md (§4, §5).
// All project fields are OPTIONAL because the migration (supabase-farm-plots.sql)
// may not be applied yet — read defensively everywhere.

export type ProjectLandType =
  | "farm_plot_project"
  | "managed_farmland"
  | "farmhouse_plot"
  | "gated_farm_plot"
  | "plantation_project";

export const PROJECT_LAND_TYPES: ProjectLandType[] = [
  "farm_plot_project",
  "managed_farmland",
  "farmhouse_plot",
  "gated_farm_plot",
  "plantation_project",
];

const PROJECT_SET = new Set<string>(PROJECT_LAND_TYPES);

/** True when a listing's land_type is one of the farm-project types. Null-safe. */
export function isProjectType(landType?: string | null): boolean {
  return !!landType && PROJECT_SET.has(landType);
}

export type ProjectStage = "pre_launch" | "launched" | "partial_inventory" | "completed";
export type PlotSizeUnit = "sqft" | "guntha" | "cent" | "acre";
export type MaintenancePeriod = "monthly" | "quarterly" | "yearly" | "one_time";
export type LayoutApprovalStatus = "approved" | "pending" | "not_required" | "unknown";
export type ConversionStatus = "converted" | "agricultural" | "partial" | "unknown";
export type PossessionTimeline = "ready" | "6_months" | "12_months" | "24_months" | "phased";
export type PlotStatus = "available" | "sold" | "reserved" | "on_hold";

export type StateSlug = "karnataka" | "tamil_nadu";

export type Corridor = {
  slug: string;        // matches the /farm-plots/[corridor] URL
  label: string;       // display name
  parent_city: string; // 'bangalore'
  state: StateSlug;     // routes legal CTA to /legal/state/[state]
};

export type Amenity = {
  key: string;     // stored in listings.amenities (jsonb string array)
  label: string;
  icon: string;    // Lucide icon name (data only; not imported as a component yet)
  emoji: string;   // lightweight visual used until an icon lib is added
};

// The additive project columns on `listings` (all optional / nullable).
export type ProjectFields = {
  project_name?: string | null;
  developer_name?: string | null;
  project_stage?: ProjectStage | null;
  total_project_acres?: number | null;
  plot_count?: number | null;
  plot_size_min_value?: number | null;
  plot_size_max_value?: number | null;
  plot_size_unit?: PlotSizeUnit | null;
  maintenance_fee_amount?: number | null;
  maintenance_fee_period?: MaintenancePeriod | null;
  corridor?: string | null;
  nearest_city?: string | null;
  distance_from_city_km?: number | null;
  travel_time_minutes?: number | null;
  layout_approval_status?: LayoutApprovalStatus | null;
  conversion_status?: ConversionStatus | null;
  amenities?: string[] | null;
  possession_timeline?: PossessionTimeline | null;
};

export type FarmProjectPlot = {
  id: string;
  listing_id: string;
  plot_label?: string | null;
  size_value: number;
  size_unit: PlotSizeUnit;
  price?: number | null;
  status: PlotStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};
