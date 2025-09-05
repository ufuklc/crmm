-- Supabase Schema – Emlak CRM
-- Çalıştırma: Supabase SQL Editor veya CLI ile uygulayın.

-- Uzantılar
create extension if not exists pgcrypto;

-- Ortak alanlar için tipler
create schema if not exists app;

-- Tablolar
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_owners (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Müşteriler
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text not null,
  cash_or_loan text not null check (cash_or_loan in ('Nakit','Kredi')),
  profession_id uuid references public.professions(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Varlıklar
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('Daire','İş Yeri','Arsa')),
  listing_type text not null check (listing_type in ('Satılık','Kiralık')),
  city text not null,
  district text not null,
  neighborhood text not null,
  price numeric not null check (price >= 0),
  gross_m2 numeric not null check (gross_m2 > 0),
  net_m2 numeric,
  rooms int,
  heating text,
  building_age_range int4range,
  floor int,
  credit boolean,
  aspect text[] check (aspect <@ array['Kuzey','Güney','Doğu','Batı']::text[]),
  -- Daire'ye özel alanlar
  ensuite_bath boolean,
  pool boolean,
  dressing_room boolean,
  furnished boolean,
  bathroom_count int,
  balcony boolean,
  in_site boolean,
  portfolio_owner_id uuid references public.portfolio_owners(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- İş kuralları
  constraint land_not_rent check (not (type = 'Arsa' and listing_type = 'Kiralık')),
  constraint rooms_only_for_apartment_office check (
    rooms is null or type in ('Daire','İş Yeri')
  ),
  constraint heating_not_for_land check (
    heating is null or type <> 'Arsa'
  ),
  constraint building_age_range_for_apartment_office check (
    building_age_range is null or type in ('Daire','İş Yeri')
  ),
  constraint credit_only_for_sale check (
    credit is null or listing_type = 'Satılık'
  ),
  constraint apartment_only_fields_for_apartment check (
    (
      type = 'Daire'
    ) or (
      ensuite_bath is null and pool is null and dressing_room is null and furnished is null and bathroom_count is null and balcony is null and in_site is null and aspect is null
    )
  )
);

-- İstekler
create table if not exists public.customer_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null check (type in ('Daire','İş Yeri','Arsa')),
  listing_type text not null check (listing_type in ('Satılık','Kiralık')),
  city text,
  district text,
  neighborhood text,
  min_price numeric,
  max_price numeric,
  min_size numeric,
  max_size numeric,
  rooms int,
  fulfilled boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Görüşme Notları
create table if not exists public.meeting_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  content text not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bildirimler
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  kind text not null default 'weekly_followup',
  message text not null,
  is_read boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- View: Son 7 günde notu olmayan ve aktif isteği olan müşteriler
create or replace view public.customers_missing_weekly_note as
select c.id as customer_id,
       c.first_name,
       c.last_name,
       c.phone
from public.customers c
where exists (
  select 1 from public.customer_requests r
  where r.customer_id = c.id and r.fulfilled = false
)
and not exists (
  select 1 from public.meeting_notes n
  where n.customer_id = c.id and n.created_at >= now() - interval '7 days'
);


