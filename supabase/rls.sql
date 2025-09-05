-- RLS ve Tetikleyiciler

-- Ortak tetikleyiciler: set_created_by, set_updated_at
create or replace function public.set_created_by()
returns trigger as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

-- Tüm tablo listesi
do $$
declare
  t record;
  owner_policy text;
  insert_policy text;
begin
  for t in select schemaname, tablename from pg_tables where schemaname='public' and tablename in (
    'profiles','professions','portfolio_owners','customers','properties','customer_requests','meeting_notes','notifications'
  ) loop
    execute format('alter table public.%I enable row level security', t.tablename);
    -- Policy isimlerini üret
    owner_policy := format('user_is_owner_%s', t.tablename);
    insert_policy := format('user_can_insert_%s', t.tablename);

    -- Mevcut değilse okuma/güncelleme/silme için owner policy oluştur
    if not exists (
      select 1 from pg_policies p
      where p.schemaname = 'public' and p.tablename = t.tablename and p.policyname = owner_policy
    ) then
      execute format('create policy %I on public.%I using (created_by = auth.uid())', owner_policy, t.tablename);
    end if;

    -- Mevcut değilse insert için policy oluştur
    if not exists (
      select 1 from pg_policies p
      where p.schemaname = 'public' and p.tablename = t.tablename and p.policyname = insert_policy
    ) then
      execute format('create policy %I on public.%I for insert with check (created_by = auth.uid())', insert_policy, t.tablename);
    end if;
    execute format('drop trigger if exists set_created_by_trg on public.%I', t.tablename);
    execute format('create trigger set_created_by_trg before insert on public.%I for each row execute function public.set_created_by()', t.tablename);
    execute format('drop trigger if exists set_updated_at_trg on public.%I', t.tablename);
    execute format('create trigger set_updated_at_trg before update on public.%I for each row execute function public.set_updated_at()', t.tablename);
  end loop;
end $$;


