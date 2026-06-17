# Regional land terminology reference

Reference for interpreting agent WhatsApp messages across India's land markets.
The **concise** version of this is embedded in `app/lib/prompts/regional-terms.ts`
and injected into the Claude parser system prompt (spec §2.7). This file is the
fuller, human-readable form — edit both when you add a state or term.

> Not legal advice. Terms vary by district and change over time; always verify
> against the official record for the specific parcel.

---

## Unit conversions (quick table)

| Unit | Where | Equivalent |
|---|---|---|
| Gunta / Guntha | KA, AP, TG, MH | 1 acre = 40 guntas; 1 gunta ≈ 0.025 acre |
| Cent | TN, KL, parts of AP | 1 acre = 100 cents; 1 cent ≈ 435.6 sqft |
| Ground | TN (urban) | 1 ground = 2,400 sqft |
| Ankanam | AP / TG | ≈ 72 sqft (varies locally) |
| Kuncham | AP / TG | ≈ 121 sq yards (varies locally) |
| Hectare | All (metric) | 1 hectare = 2.47105 acres |
| Are | KL (metric) | 1 are = 100 sq m ≈ 0.0247 acre |

Indian number words: **1 lakh = 100,000**; **1 crore = 10,000,000**.

---

## Karnataka

- **Conversion:** "DC converted" / "DC done" / "NA done" → non-agricultural conversion completed.
- **Khata classification:** **A-Khata** = property fully legal/approved (good); **B-Khata** = irregular/unauthorised (treat with caution — flag to admin).
- **Records:** **RTC** ("Pahani") = Record of Rights, Tenancy & Crops (ownership/tenancy); **Khata** = municipal/panchayat property tax record; **Mutation** = transfer of ownership in records.
- Portal: **Bhoomi** (land records).

## Tamil Nadu

- **Land class:** **Nanjai** = wetland / irrigated agricultural; **Punjai** = dry agricultural.
- **Records:** **Patta** = ownership document; **Chitta** / **A-Register** = land ownership & extent; **Adangal** = cultivation account; **FMB** = Field Measurement Book (survey sketch).
- **Value:** **Guideline value** = government-assessed minimum land value (for stamp duty).
- Portal: **TamilNilam** / e-services.

## Andhra Pradesh & Telangana

- **Records:** **Pattadar passbook** = title/ownership; **Adangal** / **Pahani** = land record; **1-B** = ownership extract.
- **Risk flag:** **Sada bainama** = unregistered/notarised sale agreement — high risk; flag to admin.
- Portals: **Dharani** (Telangana), **Meebhoomi** (AP).

## Maharashtra

- **Records:** **7/12 extract** ("Saatbara" / "Utara") = principal land record (ownership + cultivation + loans); **8A extract** = holding/account record; **Ferfar** = mutation entry.
- **Conversion:** **NA order** = non-agricultural conversion order.
- **Officer:** **Talathi** = village revenue/record officer.
- Portal: **Mahabhulekh** (7/12 online).

## Kerala

- **Land class:** **Nilam** = paddy/wetland (conversion restricted under the Kerala Conservation of Paddy Land & Wetland Act — flag to admin); **Purayidam** = garden/dry land.
- **Records:** **Patta** = title; **Pokkuvaravu** = mutation; **Thandaper** = land tax account; **Possession certificate**.
- Portal: **ReLIS** (Revenue Land Information System).

---

## Common abbreviations

| Short | Meaning |
|---|---|
| B/W | Borewell |
| OW | Open well |
| EC | Encumbrance Certificate (shows loans/charges) |
| OC | Occupancy Certificate |
| GLV | Guideline value |
| FMB | Field Measurement Book |
