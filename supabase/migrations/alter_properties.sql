-- Properties tablosunu PRD ile uyumlu hale getir

alter table public.properties
  add column if not exists gross_m2 numeric,
  add column if not exists net_m2 numeric,
  add column if not exists building_age_range int4range,
  add column if not exists ensuite_bath boolean,
  add column if not exists pool boolean,
  add column if not exists dressing_room boolean,
  add column if not exists furnished boolean,
  add column if not exists bathroom_count int,
  add column if not exists balcony boolean,
  add column if not exists in_site boolean;

-- Eski size -> gross_m2 taşı ve size kolonunu kaldır
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='properties' and column_name='size') then
    update public.properties set gross_m2 = coalesce(gross_m2, size);
    alter table public.properties drop column if exists size;
  end if;
end $$;

-- Eski building_age varsa yeni aralığa taşı (basit aralık)
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='properties' and column_name='building_age') then
    update public.properties set building_age_range = coalesce(building_age_range, int4range(0, greatest(building_age,0)+1, '[]'));
    alter table public.properties drop column if exists building_age;
  end if;
end $$;

-- Eski kısıtları kaldır
alter table public.properties
  drop constraint if exists building_age_for_apartment_office;

-- Güncel kısıtları ekle (varsa atla)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'building_age_range_for_apartment_office'
  ) then
    alter table public.properties
      add constraint building_age_range_for_apartment_office
      check (building_age_range is null or type in ('Daire','İş Yeri'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'apartment_only_fields_for_apartment'
  ) then
    alter table public.properties
      add constraint apartment_only_fields_for_apartment
      check (
        (type = 'Daire') or (
          ensuite_bath is null and pool is null and dressing_room is null and furnished is null and bathroom_count is null and balcony is null and in_site is null and aspect is null
        )
      );
  end if;
end $$;


