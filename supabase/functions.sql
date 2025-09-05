-- İşlevler

-- İstek için eşleşen varlıkları döndür
create or replace function public.match_properties_for_request(req_id uuid)
returns table(property_id uuid) as $$
begin
  return query
  select p.id from public.properties p
  join public.customer_requests r on r.id = req_id
  where p.type = r.type
    and p.listing_type = r.listing_type
    and (r.city is null or p.city = r.city)
    and (r.district is null or p.district = r.district)
    and (r.neighborhood is null or p.neighborhood = r.neighborhood)
    and (r.min_price is null or p.price >= r.min_price)
    and (r.max_price is null or p.price <= r.max_price)
    and (r.min_size is null or p.size >= r.min_size)
    and (r.max_size is null or p.size <= r.max_size);
end;
$$ language plpgsql stable;

-- Haftalık bildirim üret
create or replace function public.create_weekly_notifications_for_current_week()
returns void as $$
begin
  insert into public.notifications (customer_id, message, created_by)
  select cmn.customer_id,
         'Aktif isteği var ve son 7 günde görüşme notu yok',
         auth.uid()
  from public.customers_missing_weekly_note cmn
  on conflict do nothing;
end;
$$ language plpgsql security definer;


