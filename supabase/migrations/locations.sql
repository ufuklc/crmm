-- Lokasyon tabloları: sehirler, ilceler, mahalleler

-- Eski hatalı şemayı temizle (varsa) – özellikle districts/neighborhoods için
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='neighborhoods') then
    drop table if exists public.neighborhoods cascade;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='districts') then
    drop table if exists public.districts cascade;
  end if;
end $$;

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(city_id, name)
);

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references public.districts(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(district_id, name)
);

-- properties.aspect için TR cephe seti
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'properties_aspect_allowed') then
    alter table public.properties drop constraint properties_aspect_allowed;
  end if;
  if exists (select 1 from pg_constraint where conname = 'properties_aspect_check') then
    alter table public.properties drop constraint properties_aspect_check;
  end if;
  -- Eski İngilizce yön kısaltmalarını TR karşılıklarına dönüştür ve geçersizleri temizle
  -- (N->Kuzey, S->Güney, E->Doğu, W->Batı). Zaten TR olanlar korunur.
  update public.properties p
  set aspect = sub.new_aspect
  from (
    select p2.id,
           (
             select case when count(v) = 0 then null else array_agg(v) end
             from (
               select case
                        when x in ('Kuzey','Güney','Doğu','Batı') then x
                        when x = 'N' then 'Kuzey'
                        when x = 'S' then 'Güney'
                        when x = 'E' then 'Doğu'
                        when x = 'W' then 'Batı'
                        else null
                      end as v
               from unnest(p2.aspect) as x
             ) s
             where v is not null
           ) as new_aspect
    from public.properties p2
    where p2.aspect is not null
  ) sub
  where p.id = sub.id;
  alter table public.properties
    add constraint properties_aspect_allowed
    check (aspect is null or aspect <@ array['Kuzey','Güney','Doğu','Batı']::text[]);
end $$;


