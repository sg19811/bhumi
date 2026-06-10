// Post-purchase constants + the compliance copy that must appear on member views.

export const EXPENSE_CATEGORIES: { key: string; label: string }[] = [
  ["maintenance", "Maintenance"], ["caretaker", "Caretaker"], ["security", "Security"], ["water", "Water"],
  ["electricity", "Electricity"], ["farming", "Farming"], ["fencing_repair", "Fencing repair"], ["civil_repair", "Civil repair"],
  ["plantation", "Plantation"], ["tax", "Tax"], ["legal", "Legal"], ["insurance", "Insurance"],
  ["common_amenity", "Common amenity"], ["professional_fee", "Professional fee"], ["other", "Other"],
].map(([key, label]) => ({ key, label }));
export const expenseCategoryLabel = (k: string) => EXPENSE_CATEGORIES.find((c) => c.key === k)?.label ?? k.replace(/_/g, " ");

export const EXIT_TYPES: { key: string; label: string }[] = [
  { key: "sell_to_existing_member", label: "Sell to an existing member" },
  { key: "sell_to_new_buyer", label: "Sell to a new buyer" },
  { key: "partition_request", label: "Request a partition" },
  { key: "gift_transfer", label: "Gift / transfer" },
  { key: "inheritance", label: "Inheritance" },
];

export const DEFAULT_PROPOSAL_OPTIONS = [
  { key: "yes", label: "Yes" }, { key: "no", label: "No" }, { key: "abstain", label: "Abstain" },
];

export const POST_PURCHASE_DISCLAIMERS = {
  recordKeeping:
    "This is a record-keeping tool. Your legal financial obligations are governed by the co-ownership agreement, not this platform. Resolve any dispute per that agreement.",
  advisoryVote:
    "Advisory vote — the final decision rests with the co-ownership agreement and the circle's consensus, not this tally. The platform does not enforce outcomes.",
  noMoney:
    "No money moves through this platform. Payments happen outside it — between members and directly to vendors or government.",
  exitIsIntent:
    "Registering an exit records your intent only. The actual transfer is a legal process handled by a lawyer; nothing here transfers any ownership.",
} as const;
