// Default document checklist seeded when a circle is created. Generic docs apply
// everywhere; state-specific docs are added on top. KA/TN are mature; MH/KL/AP
// ship indicative and should be lawyer-reviewed before relying on them (spec §12).

export type DocTemplate = { doc_type: string; label: string };

const GENERIC: DocTemplate[] = [
  { doc_type: "parent_deed", label: "Parent / mother deed" },
  { doc_type: "sale_deed", label: "Sale deed (current owner)" },
  { doc_type: "ec", label: "Encumbrance certificate (30 yrs)" },
  { doc_type: "mutation", label: "Mutation records" },
  { doc_type: "survey_sketch", label: "Survey sketch" },
  { doc_type: "tax_receipts", label: "Latest tax receipts" },
  { doc_type: "litigation_check", label: "Litigation / dispute check" },
  { doc_type: "lawyer_opinion", label: "Lawyer's title opinion" },
  { doc_type: "co_ownership_agreement_draft", label: "Co-ownership agreement (draft)" },
  { doc_type: "sale_agreement_draft", label: "Sale agreement (draft)" },
];

const BY_STATE: Record<string, DocTemplate[]> = {
  karnataka: [
    { doc_type: "rtc_pahani", label: "RTC / Pahani" },
    { doc_type: "11e_phodi", label: "11E phodi sketch" },
    { doc_type: "ptcl_check", label: "PTCL (granted land) check" },
    { doc_type: "conversion_order_ka", label: "DC conversion order" },
  ],
  tamil_nadu: [
    { doc_type: "patta_chitta", label: "Patta & chitta" },
    { doc_type: "a_register", label: "A-register extract" },
    { doc_type: "fmb_sketch_tn", label: "FMB sketch" },
    { doc_type: "poramboke_check", label: "Poramboke check" },
    { doc_type: "dtcp_approval", label: "DTCP / layout approval" },
  ],
  maharashtra: [
    { doc_type: "7_12", label: "7/12 extract" },
    { doc_type: "8a", label: "8A extract" },
    { doc_type: "ferfar", label: "Ferfar (mutation)" },
    { doc_type: "section_63_check", label: "Section 63 / tenure check" },
    { doc_type: "na_conversion_mh", label: "NA conversion order" },
  ],
  kerala: [
    { doc_type: "btr", label: "Basic Tax Register (BTR)" },
    { doc_type: "thandaper", label: "Thandaper account" },
    { doc_type: "pokkuvaravu", label: "Pokkuvaravu (mutation)" },
    { doc_type: "data_bank_check_kl", label: "Paddy/wetland data bank check" },
  ],
  andhra_pradesh: [
    { doc_type: "adangal", label: "Adangal / pahani" },
    { doc_type: "ror_1b", label: "ROR 1-B" },
    { doc_type: "lp_map_ap", label: "LP / FMB map" },
    { doc_type: "22a_check", label: "22A prohibited-land check" },
    { doc_type: "assigned_land_check_ap", label: "Assigned-land check" },
  ],
};

export function documentsForState(state?: string | null): DocTemplate[] {
  const stateDocs = state ? BY_STATE[state] ?? [] : [];
  return [...GENERIC, ...stateDocs];
}

const ALL_LABELS: Record<string, string> = {};
for (const d of [...GENERIC, ...Object.values(BY_STATE).flat()]) ALL_LABELS[d.doc_type] = d.label;
export const docTypeLabel = (t: string) => ALL_LABELS[t] ?? t.replace(/_/g, " ");
