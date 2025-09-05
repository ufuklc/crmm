-- Customers: tercih edilen ilan tipi (Satılık/Kiralık)
alter table public.customers
  add column if not exists preferred_listing_type text check (preferred_listing_type in ('Satılık','Kiralık'));


