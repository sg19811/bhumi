// The service categories AcrehubIndia can coordinate (for a documented fee, no
// guarantees). Shown read-only on opportunity pages and as a multi-select on the
// interest form to capture demand — the service *workflow* is Phase 3, not now.

export type ServiceCategory = { key: string; label: string; description: string };

export const CO_BUY_SERVICE_CATEGORIES: ServiceCategory[] = [
  { key: "legal_due_diligence", label: "Legal due diligence", description: "Title search, encumbrance, and document verification by a lawyer." },
  { key: "title_verification", label: "Title & ownership check", description: "Confirming the seller's title and the chain of ownership." },
  { key: "survey_demarcation", label: "Survey & demarcation", description: "Licensed survey, boundary marking, and sub-division mapping." },
  { key: "registration_stamp_duty", label: "Registration & stamp duty", description: "Coordinating the sale deed, stamp duty, and registration." },
  { key: "land_conversion", label: "Land conversion (NA)", description: "Assistance with the conversion process where permitted." },
  { key: "fencing_boundary", label: "Fencing & boundary", description: "Fencing, gates, and boundary protection contractors." },
  { key: "civil_site_work", label: "Civil & site development", description: "Levelling, roads, water, and basic site infrastructure." },
  { key: "security_caretaking", label: "Security & caretaking", description: "Ongoing site security and caretaker arrangements." },
  { key: "farm_consulting", label: "Farm setup & consulting", description: "Agronomy, plantation planning, and farm setup advice." },
];

export const serviceCategoryLabel = (key: string) =>
  CO_BUY_SERVICE_CATEGORIES.find((c) => c.key === key)?.label ?? key.replace(/_/g, " ");
