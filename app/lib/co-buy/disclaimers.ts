// Buying Circles — compliance copy. These strings are tuned for India's
// regulatory landscape and are cautious ON PURPOSE. Do NOT paraphrase them for
// "better tone." Reused across pages and the interest form.

export const CO_BUY_DISCLAIMERS = {
  expressionOnly:
    "This is only an expression of interest. It is not a legal offer, securities product, investment advice, or final legal opinion.",
  servicesCoordination:
    "AcrehubIndia can coordinate lawful administrative, legal, professional, and infrastructure services for a fee. We do not guarantee approvals, legal outcomes, government decisions, returns, or timelines.",
  complexity:
    "Co-buying land is legally complex. Do not pay money or sign documents without lawyer review.",
  noUnofficialPayments:
    "AcrehubIndia never asks for unofficial or cash payments to influence any government, revenue, or legal process. All fees are documented and for lawful services only.",
  noOwnershipUntilRegistration:
    "You do not acquire any ownership, right, or interest in land until a registered sale deed is executed in your name. Expressing interest creates no such right.",
  nriWarning:
    "NRIs, OCIs, and foreign nationals face specific restrictions under FEMA/RBI rules on owning agricultural land in India. Such interest is reviewed separately and requires legal clearance before any engagement — do not proceed on assumptions.",
} as const;

// The 8 acknowledgement checkboxes on the interest form. Submission is blocked —
// client AND server — until every one of these is checked true.
export const CO_BUY_ACKNOWLEDGEMENTS: { key: string; label: string }[] = [
  {
    key: "ack_expression_only",
    label:
      "I understand this is only an expression of interest — not a legal offer, securities product, investment advice, or final legal opinion.",
  },
  {
    key: "ack_no_legal_advice",
    label:
      "I understand AcrehubIndia is not my lawyer and nothing here is legal advice; I will rely on my own independent lawyer.",
  },
  {
    key: "ack_no_ownership_until_registration",
    label:
      "I understand I acquire no ownership or right in any land until a registered sale deed is executed in my name.",
  },
  {
    key: "ack_lawyer_review_required",
    label:
      "I understand I must have a lawyer review all documents, and I will not pay money or sign anything without that review.",
  },
  {
    key: "ack_state_eligibility_varies",
    label:
      "I understand who can buy agricultural land, and how, varies by state, and my eligibility must be confirmed for my situation.",
  },
  {
    key: "ack_nri_special_review",
    label:
      "If I am an NRI, OCI, or foreign national, I understand special FEMA/RBI restrictions apply and my interest needs separate legal review before any engagement.",
  },
  {
    key: "ack_service_fees_separate",
    label:
      "I understand any administrative, legal, professional, or infrastructure services AcrehubIndia coordinates are charged as separate, documented fees with no guaranteed outcomes.",
  },
  {
    key: "ack_consent_to_contact",
    label:
      "I consent to AcrehubIndia contacting me by phone, WhatsApp, or email about this expression of interest.",
  },
];

export const CO_BUY_ACK_KEYS = CO_BUY_ACKNOWLEDGEMENTS.map((a) => a.key);
