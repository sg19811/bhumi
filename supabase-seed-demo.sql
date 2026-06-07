-- ============================================================================
-- AcreHub — DEMO listings seed (sample data, NOT real parcels)
-- ----------------------------------------------------------------------------
-- WHY: so the live site looks alive and the price-insight / market-snapshot
--      panels become visible before real listings arrive. Every row is clearly
--      labelled "Sample listing" in its title and description.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
--      Safe to re-run: rows use fixed IDs and UPSERT (no duplicates).
--
-- TO REMOVE ALL DEMO DATA LATER, run:
--      delete from public.listings where id::text like '00000000-0000-4000-8000-0000000000d%';
--
-- Notes:
--   * No photos on purpose — an honest "Photo coming soon" placeholder beats
--     misleading stock farm images on a trust-first marketplace.
--   * Prices are realistic ranges for these districts but illustrative only.
--   * Clustered so comparables exist: Mysuru/irrigated (4), Mandya/agri (3),
--     Pune/orchard (3) — enough for the per-acre price panels to appear.
-- ============================================================================

insert into public.listings
  (id, owner_user_id, title, description, land_type, price, price_basis,
   area_value, area_unit, latitude, longitude, district, taluka, village,
   water_source, road_access, electricity, photos, status, is_verified, created_at, updated_at)
values
  -- ---- Mysuru · irrigated farmland (4) ----------------------------------
  ('00000000-0000-4000-8000-0000000000d1', null,
   'Sample listing: 5-acre irrigated farm near Nanjangud',
   'Sample listing for demonstration — not a real parcel. Level, red-soil farmland with a working borewell and three-phase power nearby. Suited to vegetables and short-duration crops.',
   'irrigated_farmland', 1800000, 'per_acre', 5, 'acre', 12.1167, 76.6833,
   'Mysuru', 'Nanjangud', 'Hadinaru', 'Borewell', 'Tar road', true, '{}', 'active', true,
   now() - interval '4 days', now() - interval '4 days'),

  ('00000000-0000-4000-8000-0000000000d2', null,
   'Sample listing: Borewell-fed farmland, T. Narasipura',
   'Sample listing for demonstration — not a real parcel. Gently sloping plot with assured water from two borewells. Mud road access, electricity at the boundary.',
   'irrigated_farmland', 2200000, 'per_acre', 3, 'acre', 12.2167, 76.9000,
   'Mysuru', 'T. Narasipura', 'Talakad', 'Borewell', 'Mud road', true, '{}', 'active', false,
   now() - interval '9 days', now() - interval '9 days'),

  ('00000000-0000-4000-8000-0000000000d3', null,
   'Sample listing: Canal-irrigated 6 acres, Hunsur',
   'Sample listing for demonstration — not a real parcel. Fertile land alongside a branch canal, currently under sugarcane. Tar road frontage and a farm shed.',
   'irrigated_farmland', 12000000, 'total', 6, 'acre', 12.3047, 76.2931,
   'Mysuru', 'Hunsur', 'Gavadagere', 'Canal', 'Tar road', true, '{}', 'active', true,
   now() - interval '18 days', now() - interval '18 days'),

  ('00000000-0000-4000-8000-0000000000d4', null,
   'Sample listing: Red-soil irrigated plot, Periyapatna',
   'Sample listing for demonstration — not a real parcel. Well-drained red soil with a borewell and open well. Good for areca, coconut and intercrops.',
   'irrigated_farmland', 1500000, 'per_acre', 4, 'acre', 12.3380, 76.0980,
   'Mysuru', 'Periyapatna', 'Bettadapura', 'Well', 'Mud road', false, '{}', 'active', false,
   now() - interval '2 days', now() - interval '2 days'),

  -- ---- Mandya · agricultural land (3) -----------------------------------
  ('00000000-0000-4000-8000-0000000000d5', null,
   'Sample listing: 4-acre agricultural land, Maddur',
   'Sample listing for demonstration — not a real parcel. Flat cultivable land near the highway, suitable for paddy and pulses. Borewell on site.',
   'agri_land', 1600000, 'per_acre', 4, 'acre', 12.5847, 77.0436,
   'Mandya', 'Maddur', 'Koppa', 'Borewell', 'Highway', true, '{}', 'active', false,
   now() - interval '6 days', now() - interval '6 days'),

  ('00000000-0000-4000-8000-0000000000d6', null,
   'Sample listing: 5-acre farmland, Malavalli',
   'Sample listing for demonstration — not a real parcel. Rainfed land with a rebuilt farm pond for water harvesting. Quiet location, mud road access.',
   'agri_land', 7000000, 'total', 5, 'acre', 12.3847, 77.0653,
   'Mandya', 'Malavalli', 'Halaguru', 'Pond', 'Mud road', false, '{}', 'active', false,
   now() - interval '13 days', now() - interval '13 days'),

  ('00000000-0000-4000-8000-0000000000d7', null,
   'Sample listing: 3-acre fertile land, Srirangapatna',
   'Sample listing for demonstration — not a real parcel. Cauvery-belt land with assured borewell water and three-phase power. Tar road frontage.',
   'agri_land', 2000000, 'per_acre', 3, 'acre', 12.4181, 76.6947,
   'Mandya', 'Srirangapatna', 'Ganjam', 'Borewell', 'Tar road', true, '{}', 'active', true,
   now() - interval '21 days', now() - interval '21 days'),

  -- ---- Pune · orchards (3) ----------------------------------------------
  ('00000000-0000-4000-8000-0000000000d8', null,
   'Sample listing: Pomegranate orchard, Junnar',
   'Sample listing for demonstration — not a real parcel. Established pomegranate orchard with drip irrigation and a borewell. Hilly backdrop, all-weather road.',
   'orchard', 3500000, 'per_acre', 4, 'acre', 19.2089, 73.8753,
   'Pune', 'Junnar', 'Narayangaon', 'Borewell', 'Tar road', true, '{}', 'active', true,
   now() - interval '5 days', now() - interval '5 days'),

  ('00000000-0000-4000-8000-0000000000d9', null,
   'Sample listing: 6-acre orchard land, Baramati',
   'Sample listing for demonstration — not a real parcel. Mature grape and seasonal-fruit plot with canal plus borewell water. Suited to expansion.',
   'orchard', 24000000, 'total', 6, 'acre', 18.1514, 74.5772,
   'Pune', 'Baramati', 'Malegaon', 'Canal', 'Tar road', true, '{}', 'active', false,
   now() - interval '11 days', now() - interval '11 days'),

  ('00000000-0000-4000-8000-0000000000da', null,
   'Sample listing: Hillside orchard plot, Mulshi',
   'Sample listing for demonstration — not a real parcel. Scenic 2-acre orchard plot near the lake, ideal for high-value horticulture or a weekend farm.',
   'orchard', 5000000, 'per_acre', 2, 'acre', 18.5210, 73.5080,
   'Pune', 'Mulshi', 'Paud', 'Well', 'Tar road', true, '{}', 'active', true,
   now() - interval '1 days', now() - interval '1 days')

on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  land_type = excluded.land_type,
  price = excluded.price,
  price_basis = excluded.price_basis,
  area_value = excluded.area_value,
  area_unit = excluded.area_unit,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  district = excluded.district,
  taluka = excluded.taluka,
  village = excluded.village,
  water_source = excluded.water_source,
  road_access = excluded.road_access,
  electricity = excluded.electricity,
  status = excluded.status,
  is_verified = excluded.is_verified;
