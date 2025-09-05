-- Add cash_or_loan to customer_requests and useful indexes for performance
alter table if exists public.customer_requests
  add column if not exists cash_or_loan text check (cash_or_loan in ('Nakit','Kredi'));

-- Indexes for frequent filters
create index if not exists idx_properties_city_district_neighborhood on public.properties (city, district, neighborhood);
create index if not exists idx_properties_listing_type on public.properties (listing_type);
create index if not exists idx_properties_type on public.properties (type);
create index if not exists idx_properties_price on public.properties (price);
create index if not exists idx_properties_gross_m2 on public.properties (gross_m2);
create index if not exists idx_properties_room_plan on public.properties (room_plan);
create index if not exists idx_properties_building_age on public.properties (building_age);
create index if not exists idx_properties_building_floors on public.properties (building_floors);
create index if not exists idx_properties_floor on public.properties (floor);

create index if not exists idx_customer_requests_customer on public.customer_requests (customer_id);


