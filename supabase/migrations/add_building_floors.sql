-- Properties: kat sayısı (sadece Daire için geçerli)
alter table public.properties
  add column if not exists building_floors int check (building_floors is null or building_floors >= 0);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'building_floors_only_for_apartment'
  ) then
    alter table public.properties
      add constraint building_floors_only_for_apartment
      check (building_floors is null or type = 'Daire');
  end if;
end $$;


