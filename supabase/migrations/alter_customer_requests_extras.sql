-- Extend customer_requests with optional property-like preferences (display only)
alter table if exists public.customer_requests
  add column if not exists heating text,
  add column if not exists ensuite_bath boolean,
  add column if not exists pool boolean,
  add column if not exists dressing_room boolean,
  add column if not exists furnished boolean,
  add column if not exists bathroom_count int,
  add column if not exists balcony boolean,
  add column if not exists in_site boolean,
  add column if not exists floor int,
  add column if not exists building_floors int,
  add column if not exists building_age int;


