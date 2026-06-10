// Canonical 10-milestone path seeded when a circle is created. Lawyer should
// confirm the sequence is right for the states you operate in (spec §12).

export type MilestoneTemplate = { milestone_key: string; title: string; description: string };

export const MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  { milestone_key: "group_forming", title: "Group forming", description: "Gathering interested, qualified buyers for this parcel." },
  { milestone_key: "group_qualified", title: "Group qualified", description: "Enough committed buyers to proceed; circle confirmed." },
  { milestone_key: "lawyer_engaged", title: "Lawyer engaged", description: "An independent lawyer is engaged to review title and documents." },
  { milestone_key: "site_visit_done", title: "Site visit done", description: "The group has visited and inspected the parcel together." },
  { milestone_key: "documents_under_review", title: "Documents under review", description: "Title, encumbrance, and revenue records are being verified." },
  { milestone_key: "legal_clear", title: "Legal clear", description: "Lawyer has confirmed the title and legal status are clear." },
  { milestone_key: "sale_agreement", title: "Sale agreement", description: "Sale agreement and co-ownership agreement drafted and reviewed." },
  { milestone_key: "registration_scheduled", title: "Registration scheduled", description: "Registration appointment booked at the sub-registrar's office." },
  { milestone_key: "registration_complete", title: "Registration complete", description: "Sale deed registered; ownership transferred." },
  { milestone_key: "handoff_to_phase5", title: "Post-purchase handoff", description: "Circle moves into ongoing stewardship and governance." },
];
