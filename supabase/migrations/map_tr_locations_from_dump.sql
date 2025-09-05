-- Bu betik, emreuenal/turkiye-il-ilce-sokak-mahalle-veri-tabani Postgres dump'ındaki
-- iller / ilceler / mahalleler tablolarından uygulamadaki cities / districts / neighborhoods
-- tablolarına veriyi taşır. Dump'ı Supabase'e içe aktardıktan sonra bu betiği çalıştırın.

-- 1) Şehirleri aktar
insert into public.cities (name)
select distinct trim(i.il_adi)
from public.iller i
on conflict (name) do nothing;

-- 2) İlçeleri şehirlerle eşleştirerek aktar
insert into public.districts (city_id, name)
select c.id, trim(x.ilce_adi)
from (
  select distinct trim(il_adi) as il_adi, trim(ilce_adi) as ilce_adi
  from public.ilceler
) x
join public.cities c on c.name = x.il_adi
on conflict (city_id, name) do nothing;

-- 3) Mahalleleri (köy/mezra/mevki dahil) ilçe ve şehir ile eşleştirerek aktar
insert into public.neighborhoods (district_id, name)
select d.id, trim(m.mahalle_adi)
from public.mahalleler m
join public.cities c on c.name = trim(m.il_adi)
join public.districts d on d.name = trim(m.ilce_adi) and d.city_id = c.id
on conflict (district_id, name) do nothing;

-- (İsteğe bağlı) Staging tabloları temizlemek için aşağıdakileri kullanabilirsiniz:
-- drop table if exists public.mahalleler;
-- drop table if exists public.ilceler;
-- drop table if exists public.iller;


