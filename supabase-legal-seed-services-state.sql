-- ============================================================================
-- AcreHub — Land Legal Navigator  ·  State-specific service packages
-- Adds a nullable `state` column to legal_services and seeds the signature
-- specialty package each state doc highlighted (beyond the 8 pan-India ones).
-- Run AFTER supabase-legal-navigator.sql + supabase-legal-seed.sql.
-- Safe to re-run (idempotent column add + UPSERT on slug).
-- Indicative pricing only; clearly mock until a lawyer panel sets real quotes.
-- ============================================================================

alter table public.legal_services add column if not exists state text;

insert into public.legal_services
  (slug, name, description, included_items, target_users, required_documents,
   turnaround_days_min, turnaround_days_max, starting_price_placeholder, display_order, state, published)
values
('ka-ptcl-granted-land-review', 'PTCL / Granted Land Risk Review',
 'For Karnataka land where grant history or SC/ST (PTCL) restrictions may apply.',
 '{Grant document review,PTCL risk flagging,Transfer-permission review,Revenue case-search checklist,Lawyer risk note}',
 '{buyer}', '{Grant order / saguvali chit,RTC,Mutation extract}', 3, 7, 6000, 11, 'karnataka', true),

('mh-section-63-eligibility-review', 'Section 63 Eligibility Review',
 'Check whether a non-agriculturist can buy a given Maharashtra parcel, and the permission route.',
 '{Agriculturist-status review,Section 63 / 63(1C) opinion,Collector-permission route,Written summary}',
 '{buyer}', '{Buyer status proof,7/12 extract,Land details}', 3, 7, 5000, 12, 'maharashtra', true),

('mh-industrial-township-land-review', 'Industrial / Township Land Review',
 'Section 63-IA route review for industrial, logistics, warehouse, solar, or township land.',
 '{Section 63-IA route review,Planning-zone check,Occupant Class-II premium/permission,Utilization-timeline & charge risk,Corporate documents review}',
 '{agent,buyer}', '{Entity documents,7/12 extract,Project details}', 7, 21, 20000, 13, 'maharashtra', true),

('ap-assigned-dkt-dotted-land-review', 'Assigned / DKT / Dotted Land Risk Review',
 'For Andhra Pradesh land with government assignment, DKT, dotted, or unclear revenue history.',
 '{Assignment / DKT history review,Transferability check,Dotted-land status review,Freehold / regularisation check,Resumption-risk summary}',
 '{buyer}', '{Assignment / DKT documents,Adangal,ROR-1B}', 4, 10, 7500, 14, 'andhra_pradesh', true),

('kl-paddy-wetland-data-bank-review', 'Paddy / Wetland (Data Bank) Legal Review',
 'For Kerala land recorded as nilam, paddy, wetland, or Data Bank land.',
 '{BTR classification review,Data Bank status review,Conversion-history review,RDO order review,Water-conservancy requirement flag}',
 '{buyer}', '{BTR extract,Possession certificate,Data Bank status}', 5, 12, 8000, 15, 'kerala', true),

('tn-farm-plot-dtcp-review', 'Farm Plot / DTCP Approval Check',
 'For Tamil Nadu farm plots and plotted development — layout, conversion, and DTCP checks.',
 '{Layout-approval check,Land-use conversion check,DTCP / local-body approval review,Road-access & handover review,Development risk summary}',
 '{buyer,agent}', '{Patta / Chitta,Layout documents,FMB sketch}', 5, 12, 9000, 16, 'tamil_nadu', true)
on conflict (slug) do update set
  name = excluded.name, description = excluded.description, included_items = excluded.included_items,
  target_users = excluded.target_users, required_documents = excluded.required_documents,
  turnaround_days_min = excluded.turnaround_days_min, turnaround_days_max = excluded.turnaround_days_max,
  starting_price_placeholder = excluded.starting_price_placeholder, display_order = excluded.display_order,
  state = excluded.state, published = excluded.published;

notify pgrst, 'reload schema';
