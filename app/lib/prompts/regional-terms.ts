// Regional land terminology reference, injected into the WhatsApp parser prompt
// (spec 2.7). Embedded as a constant (not read from disk) so it works in
// serverless/edge runtimes. Kept concise to control per-parse token cost.
// Human-readable long form lives in docs/regional-land-terms.md.

export const REGIONAL_TERMS_REFERENCE = `KARNATAKA:
- Units: 1 acre = 40 guntas (1 gunta ≈ 0.025 acre).
- "DC converted" / "DC done" / "NA done" → conversion_status = "done".
- "A-Khata" = fully legal/approved (good); "B-Khata" = irregular/unauthorised (caution) → note in agent_notes_to_admin.
- "RTC" / "Pahani" = record of rights (ownership/tenancy). "Khata" = property tax record. "Mutation" = ownership transfer entry.

TAMIL NADU:
- Units: 1 acre = 100 cents; 1 ground = 2400 sqft.
- "Nanjai" = wetland / irrigated agricultural; "Punjai" = dry agricultural.
- "Patta" = ownership document; "Chitta" / "A-Register" = land ownership & extent record; "Adangal" = cultivation record; "FMB" = Field Measurement Book sketch; "Guideline value" = govt-assessed land value.

ANDHRA PRADESH / TELANGANA:
- Units: 1 acre = 40 guntas (cents in some belts); 1 ankanam ≈ 72 sqft; 1 kuncham = 121 sq yards (varies).
- "Pattadar passbook" = title/ownership; "Adangal" / "Pahani" = land record; "1-B" = ownership extract.
- Portals: "Dharani" (Telangana), "Meebhoomi" (AP). "Sada bainama" = unregistered/notarised sale → high risk, note in agent_notes_to_admin.

MAHARASHTRA:
- Units: "guntha" common (1 acre = 40 guntha); 1 acre ≈ 0.4047 hectare.
- "7/12 extract" / "Saatbara" / "Utara" = main land record (ownership + cultivation); "8A extract" = holding record; "Ferfar" = mutation; "NA order" = non-agricultural conversion order; "Talathi" = village revenue officer.

KERALA:
- Units: 1 acre = 100 cents; "are" used (metric).
- Classification: "Nilam" = paddy/wetland (conversion restricted under the Kerala paddy/wetland Act → caution); "Purayidam" = garden/dry land.
- "Patta" = title; "Pokkuvaravu" = mutation; "Thandaper" = land tax account; "Possession certificate".

COMMON ABBREVIATIONS:
- "B/W" = borewell; "OW" = open well; "EC" = encumbrance certificate; "OC" = occupancy certificate; "GLV" = guideline value.`;
