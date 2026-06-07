// Land Legal Navigator — selectable option lists for the wizard & selectors.
import type { BuyerType, LandType } from "@/app/lib/legal/types";

export type Option<T extends string = string> = { value: T; label: string; hint?: string };

// The 5 MVP states. `covered` flips to true once lawyer-reviewed rules are published.
export const STATES: Array<Option & { covered: boolean }> = [
  { value: "karnataka", label: "Karnataka", covered: true },
  { value: "maharashtra", label: "Maharashtra", covered: true },
  { value: "tamil_nadu", label: "Tamil Nadu", covered: false },
  { value: "andhra_pradesh", label: "Andhra Pradesh", covered: false },
  { value: "kerala", label: "Kerala", covered: false },
];

export const stateLabel = (state: string) =>
  STATES.find((s) => s.value === state)?.label ?? state.replace(/_/g, " ");

export const CITIZENSHIP_OPTIONS: Option<"indian" | "nri" | "oci" | "foreign">[] = [
  { value: "indian", label: "Indian citizen (resident)" },
  { value: "nri", label: "NRI (non-resident Indian)" },
  { value: "oci", label: "OCI / PIO" },
  { value: "foreign", label: "Foreign national" },
];

export const BUYER_TYPE_OPTIONS: Option<BuyerType>[] = [
  { value: "farmer_resident", label: "Farmer (resident)", hint: "Holds agricultural land / farmer record" },
  { value: "non_farmer_resident", label: "Non-farmer (resident)", hint: "Salaried / business, no farmer record" },
  { value: "nri", label: "NRI", hint: "Non-resident Indian" },
  { value: "oci", label: "OCI / PIO" },
  { value: "company", label: "Company (Pvt/Ltd)" },
  { value: "llp", label: "LLP" },
  { value: "partnership", label: "Partnership firm" },
  { value: "trust", label: "Trust" },
  { value: "huf", label: "HUF" },
  { value: "developer", label: "Developer" },
  { value: "institutional", label: "Institutional investor" },
];

export const FARMER_STATUS_OPTIONS: Option<"farmer" | "non_farmer" | "inherited_farmer">[] = [
  { value: "farmer", label: "I am a registered farmer" },
  { value: "non_farmer", label: "I am not a farmer" },
  { value: "inherited_farmer", label: "Farmer status by inheritance" },
];

export const LAND_TYPE_OPTIONS: Option<LandType>[] = [
  { value: "agri", label: "Agricultural land" },
  { value: "agri_dry", label: "Dry agricultural land" },
  { value: "agri_irrigated", label: "Irrigated farmland" },
  { value: "plantation", label: "Plantation" },
  { value: "orchard", label: "Orchard" },
  { value: "farmhouse", label: "Farmhouse land" },
  { value: "farm_plot", label: "Farm plot" },
  { value: "gated_farm", label: "Gated farm plot" },
  { value: "na_converted", label: "NA-converted land" },
  { value: "developed_rural", label: "Developed rural plot" },
  { value: "estate", label: "Estate" },
  { value: "commercial_rural", label: "Commercial rural land" },
  { value: "solar_suitable", label: "Solar-suitable land" },
  { value: "warehouse_suitable", label: "Warehouse-suitable land" },
  { value: "eco_tourism", label: "Eco-tourism land" },
];

export const PURPOSE_OPTIONS: Option<
  "farming" | "farmhouse" | "investment" | "plantation" | "resort" | "solar" | "other"
>[] = [
  { value: "farming", label: "Farming / cultivation" },
  { value: "farmhouse", label: "Build a farmhouse" },
  { value: "investment", label: "Investment / resale" },
  { value: "plantation", label: "Plantation" },
  { value: "resort", label: "Resort / eco-tourism" },
  { value: "solar", label: "Solar / energy project" },
  { value: "other", label: "Other" },
];

export const BUDGET_OPTIONS: Option[] = [
  { value: "0_25L", label: "Under ₹25 L" },
  { value: "25_50L", label: "₹25 L – ₹50 L" },
  { value: "50L_1Cr", label: "₹50 L – ₹1 Cr" },
  { value: "1Cr_5Cr", label: "₹1 Cr – ₹5 Cr" },
  { value: "5Cr_plus", label: "Over ₹5 Cr" },
];

export const TIMELINE_OPTIONS: Option[] = [
  { value: "within_month", label: "Within a month" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "3_6_months", label: "3–6 months" },
  { value: "6_plus", label: "6+ months" },
  { value: "just_exploring", label: "Just exploring" },
];

export const landTypeLabel = (v: string) => LAND_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v.replace(/_/g, " ");
export const buyerTypeLabel = (v: string) => BUYER_TYPE_OPTIONS.find((o) => o.value === v)?.label ?? v.replace(/_/g, " ");
