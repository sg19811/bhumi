// The 10-step due-diligence workflow. Static, pan-India guidance (general).
// step_id values are persisted to legal_dd_progress.

export type DDStep = {
  step_id: string;
  title: string;
  what: string;
  how: string;
};

export const DD_STEPS: DDStep[] = [
  {
    step_id: "verify_ownership",
    title: "Verify ownership",
    what: "Confirm the seller is the current, lawful owner.",
    how: "Match the latest RTC/7-12 and khata to the seller's ID. Be wary of GPA-only sellers.",
  },
  {
    step_id: "verify_title_chain",
    title: "Trace the title chain",
    what: "Check ownership history (the 'mother deed' chain) is unbroken.",
    how: "Review prior sale deeds going back 30+ years for gaps, gifts, or partition entries.",
  },
  {
    step_id: "check_encumbrance",
    title: "Check encumbrances",
    what: "Ensure there are no loans, mortgages, or charges on the land.",
    how: "Obtain an Encumbrance Certificate (EC) for the last 30 years from the sub-registrar.",
  },
  {
    step_id: "verify_mutation",
    title: "Confirm mutation",
    what: "Check revenue records reflect the current owner.",
    how: "Verify the mutation register / khata is updated in the seller's name.",
  },
  {
    step_id: "verify_survey",
    title: "Verify survey & boundaries",
    what: "Make sure the physical land matches the records.",
    how: "Compare the survey sketch (tippan/FMB) with an on-site measurement by a licensed surveyor.",
  },
  {
    step_id: "check_litigation",
    title: "Search for litigation",
    what: "Rule out pending court disputes over the land.",
    how: "Search court records and ask for a no-litigation declaration; a lawyer can run this.",
  },
  {
    step_id: "check_access",
    title: "Confirm legal access",
    what: "Ensure there is a legal road/right-of-way to the plot.",
    how: "Check access in the survey map; landlocked parcels need a documented easement.",
  },
  {
    step_id: "check_zoning_conversion",
    title: "Check zoning & conversion",
    what: "Confirm permitted use and whether NA conversion is needed.",
    how: "Verify the land's classification and any conversion order for non-farming use.",
  },
  {
    step_id: "check_family_consent",
    title: "Check co-owners & family consent",
    what: "Avoid future claims from co-owners or legal heirs.",
    how: "Get a family tree (Form 10), and ensure all co-owners/heirs sign the sale deed.",
  },
  {
    step_id: "verify_possession_dues",
    title: "Verify possession & dues",
    what: "Confirm vacant possession and that taxes/dues are cleared.",
    how: "Check current possession, up-to-date land-revenue receipts, and no unpaid dues.",
  },
];
