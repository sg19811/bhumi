// Service + vendor catalogs and the compliance copy. The three cost columns and
// their explainers are regulatory-critical — do NOT merge them into one "total".

export const SERVICE_CATEGORIES: { key: string; label: string }[] = [
  { key: "co_buy_coordination", label: "Co-buy coordination" },
  { key: "legal_revenue_facilitation", label: "Legal / revenue facilitation" },
  { key: "site_visit_field_verification", label: "Site visit & field verification" },
  { key: "registration_coordination", label: "Registration coordination" },
  { key: "boundary_security", label: "Boundary & security" },
  { key: "common_amenities", label: "Common amenities" },
  { key: "agriculture_plantation", label: "Agriculture / plantation" },
  { key: "architecture_planning", label: "Architecture & planning" },
  { key: "civil_works", label: "Civil works" },
  { key: "landscaping", label: "Landscaping" },
  { key: "community_farming", label: "Community farming" },
  { key: "post_purchase_maintenance", label: "Post-purchase maintenance" },
  { key: "other", label: "Other" },
];
export const serviceCategoryLabel = (k: string) => SERVICE_CATEGORIES.find((c) => c.key === k)?.label ?? k.replace(/_/g, " ");

export const VENDOR_CATEGORIES: { key: string; label: string }[] = [
  ["lawyer", "Lawyer"], ["revenue_consultant", "Revenue consultant"], ["surveyor", "Surveyor"],
  ["registration_consultant", "Registration consultant"], ["civil_contractor", "Civil contractor"],
  ["fencing_vendor", "Fencing vendor"], ["security_agency", "Security agency"], ["borewell_vendor", "Borewell vendor"],
  ["water_consultant", "Water consultant"], ["electrician", "Electrician"], ["solar_vendor", "Solar vendor"],
  ["architect", "Architect"], ["planner", "Planner"], ["landscape_designer", "Landscape designer"],
  ["agriculture_consultant", "Agriculture consultant"], ["horticulture_expert", "Horticulture expert"],
  ["farm_manager", "Farm manager"], ["caretaker", "Caretaker"], ["labour_contractor", "Labour contractor"],
  ["drone_photographer", "Drone photographer"], ["soil_testing_lab", "Soil testing lab"], ["other", "Other"],
].map(([key, label]) => ({ key, label }));
export const vendorCategoryLabel = (k: string) => VENDOR_CATEGORIES.find((c) => c.key === k)?.label ?? k.replace(/_/g, " ");

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  requested: "Requested", under_review: "Under review", quote_pending: "Quote pending", quoted: "Quoted",
  buyer_approval_pending: "Awaiting circle approval", approved: "Approved", in_progress: "In progress",
  completed: "Completed", cancelled: "Cancelled", on_hold: "On hold",
};

// The three cost columns — labels + the exact compliance explainer copy (spec §8).
export const COST_COLUMNS = [
  { key: "official_fees_estimate", label: "Official / government fees", explainer: "Paid lawfully to government via proper official channels." },
  { key: "vendor_cost_estimate", label: "Vendor cost", explainer: "Paid to the third-party vendor for work executed." },
  { key: "acrehub_service_fee", label: "AcrehubIndia coordination fee", explainer: "Charged by AcrehubIndia for managing this service." },
] as const;

export const SERVICE_DISCLAIMERS = {
  perRequest:
    "AcrehubIndia coordinates this service. We do not guarantee government approvals, legal outcomes, vendor performance, construction quality, or final costs. Quoted amounts are estimates; actual costs may vary.",
  vendor:
    "Vendors are coordinated by AcrehubIndia but operate independently. AcrehubIndia does not warrant vendor work; warranties and liabilities lie with the vendor.",
  governmentFees:
    "Government fees, stamp duty, registration charges, and statutory dues must be paid lawfully through proper official channels. AcrehubIndia does not make unofficial or facilitation payments.",
  noMoneyInPlatform:
    "No money is collected through this platform. 'Approved' means the circle has agreed to proceed and pay outside the platform — it does not mean any payment has been made.",
} as const;
