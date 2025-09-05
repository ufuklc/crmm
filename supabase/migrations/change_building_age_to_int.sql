-- Properties: building_age_range -> building_age (int) ve room_plan (text)

-- 1) Sütunları ekle
alter table public.properties
  add column if not exists building_age int,
  add column if not exists room_plan text;

-- 2) Eski aralıktan değeri türet (varsa)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'properties' and column_name = 'building_age_range'
  ) then
    update public.properties
      set building_age = coalesce(building_age, lower(building_age_range));
  end if;
end $$;

-- 3) Eski kısıt ve sütunu kaldır, yenisini ekle
alter table public.properties
  drop constraint if exists building_age_range_for_apartment_office;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'building_age_for_apartment_office'
  ) then
    alter table public.properties
      add constraint building_age_for_apartment_office
      check (building_age is null or type in ('Daire','İş Yeri'));
  end if;
end $$;

alter table public.properties
  drop column if exists building_age_range;


