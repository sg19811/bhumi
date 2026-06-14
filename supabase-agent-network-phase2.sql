-- ============================================================================
-- Acrehub — Agent Network  ·  Phase 2 helpers (duplicate detection)
-- Spec section 9.2, adapted to this project's real `listings` columns
-- (village, survey_number_clean; no `state`/`village_or_landmark`).
-- Run AFTER supabase-agent-network.sql. Safe to re-run.
-- Requires pg_trgm + postgis (enabled by the Phase 1 migration).
-- ============================================================================

-- GPS-proximity lookup over the listings.geom column (added in Phase 1).
create or replace function public.listings_within_distance(
  lat numeric, lng numeric, meters numeric
) returns table (id uuid, title text, distance_meters numeric) as $$
  select
    l.id, l.title,
    st_distance(l.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography) as distance_meters
  from public.listings l
  where l.geom is not null
    and l.status = 'active'
    and st_dwithin(l.geom, st_setsrid(st_makepoint(lng, lat), 4326)::geography, meters)
  order by distance_meters asc
  limit 5;
$$ language sql stable security definer;

-- Trigram similarity on listing descriptions within the same district+taluka.
create or replace function public.listings_text_similar(
  query_text text, query_district text, query_taluka text, threshold numeric
) returns table (id uuid, title text, similarity numeric) as $$
  select
    l.id, l.title,
    similarity(coalesce(l.description, ''), query_text) as similarity
  from public.listings l
  where l.status = 'active'
    and l.district = query_district
    and l.taluka is not distinct from query_taluka
    and similarity(coalesce(l.description, ''), query_text) >= threshold
  order by similarity desc
  limit 3;
$$ language sql stable security definer;

create index if not exists idx_listings_description_trgm
  on public.listings using gin (description gin_trgm_ops);

grant execute on function public.listings_within_distance(numeric, numeric, numeric) to authenticated;
grant execute on function public.listings_text_similar(text, text, text, numeric) to authenticated;

notify pgrst, 'reload schema';
