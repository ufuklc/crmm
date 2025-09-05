import { config as loadEnv } from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) loadEnv({ path: ".env.local" });
else loadEnv();

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getOrCreateCityId(name: string): Promise<string | null> {
  // Önce var mı diye bak
  const found = await supabase.from("cities").select("id").eq("name", name).maybeSingle();
  if (found.data?.id) return found.data.id as string;
  // Ekleme dene, benzersiz ihlalinde mevcut id'yi getir
  const inserted = await supabase.from("cities").insert({ name }).select("id").single();
  if (inserted.data?.id) return inserted.data.id as string;
  if (inserted.error) {
    if ((inserted.error as any).code === "23505") {
      const again = await supabase.from("cities").select("id").eq("name", name).maybeSingle();
      if (again.data?.id) return again.data.id as string;
    }
    // eslint-disable-next-line no-console
    console.error("city error:", name, inserted.error.message);
  }
  return null;
}

async function getOrCreateDistrictId(cityId: string, name: string): Promise<string | null> {
  // Önce var mı diye bak
  const found = await supabase
    .from("districts")
    .select("id")
    .eq("city_id", cityId)
    .eq("name", name)
    .maybeSingle();
  if (found.data?.id) return found.data.id as string;
  // Ekleme dene
  const inserted = await supabase
    .from("districts")
    .insert({ city_id: cityId, name })
    .select("id")
    .single();
  if (inserted.data?.id) return inserted.data.id as string;
  if (inserted.error) {
    if ((inserted.error as any).code === "23505") {
      const again = await supabase
        .from("districts")
        .select("id")
        .eq("city_id", cityId)
        .eq("name", name)
        .maybeSingle();
      if (again.data?.id) return again.data.id as string;
    }
    // eslint-disable-next-line no-console
    console.error("district error:", name, inserted.error.message);
  }
  return null;
}

async function createNeighborhoodIfNotExists(districtId: string, name: string): Promise<void> {
  const found = await supabase
    .from("neighborhoods")
    .select("id")
    .eq("district_id", districtId)
    .eq("name", name)
    .maybeSingle();
  if (found.data?.id) return;
  const inserted = await supabase.from("neighborhoods").insert({ district_id: districtId, name });
  if (inserted.error && (inserted.error as any).code !== "23505") {
    // eslint-disable-next-line no-console
    console.error("neighborhood error:", name, inserted.error.message);
  }
}

async function main(): Promise<void> {
  // Not: Türkiye şehir/ilçe/mahalle verisini bir JSON dosyasından okuyacağız.
  // Senin sağlayacağın JSON'u proje köküne "turkiye-lokasyon.json" adıyla koyduğunda bu script içeri alacak.
  // JSON şeması:
  // [ { name: "İstanbul", districts: [ { name: "Kadıköy", neighborhoods: [ { name: "Kozyatağı" }, ... ] }, ... ] }, ... ]

  const file = "turkiye-lokasyon.json";
  if (!existsSync(file)) {
    // eslint-disable-next-line no-console
    console.error(`Lokasyon dosyası bulunamadı: ${file}. Önce dönüştürücüyü çalıştırın: npm run generate:locations-json`);
    process.exit(1);
  }

  const raw = readFileSync(file, "utf-8");
  const data = JSON.parse(raw) as Array<{ name: string; districts: Array<{ name: string; neighborhoods: Array<{ name: string }> }> }>;

  // Opsiyonel filtre: yalnızca belirli şehri işle (hızlı teşhis için)
  const onlyCity = process.env.SEED_CITY?.trim();
  const maxCities = Number.isFinite(Number(process.env.SEED_MAX_CITIES)) ? Number(process.env.SEED_MAX_CITIES) : undefined;
  const maxDistricts = Number.isFinite(Number(process.env.SEED_MAX_DISTRICTS)) ? Number(process.env.SEED_MAX_DISTRICTS) : undefined;
  const maxNeighborhoods = Number.isFinite(Number(process.env.SEED_MAX_NEIGHBORHOODS)) ? Number(process.env.SEED_MAX_NEIGHBORHOODS) : undefined;
  const filtered = onlyCity ? data.filter((c) => String(c.name).trim() === onlyCity) : data;
  const citiesToProcess = typeof maxCities === 'number' ? filtered.slice(0, Math.max(0, maxCities)) : filtered;

  // 1) Şehirler
  const cityNameToId = new Map<string, string>();
  for (let i = 0; i < citiesToProcess.length; i++) {
    const city = citiesToProcess[i];
    const name = String(city.name).trim();
    // eslint-disable-next-line no-console
    console.log(`[şehir ${i + 1}/${citiesToProcess.length}] ${name}`);
    const cityId = await getOrCreateCityId(name);
    if (cityId) cityNameToId.set(name, cityId);
    else {
      // eslint-disable-next-line no-console
      console.error("city error:", name, "id alınamadı");
    }
  }

  // 2) İlçeler
  const districtKeyToId = new Map<string, string>(); // key: cityName|districtName
  for (const city of citiesToProcess) {
    const cityName = String(city.name).trim();
    const cityId = cityNameToId.get(cityName);
    if (!cityId) continue;
    // City id doğrulaması
    const verifyCity = await supabase.from("cities").select("id").eq("id", cityId).maybeSingle();
    if (!verifyCity.data?.id) {
      // eslint-disable-next-line no-console
      console.error("FK kontrolü: şehir bulunamadı:", cityName, cityId);
      continue;
    }
    const districts = typeof maxDistricts === 'number' ? city.districts.slice(0, Math.max(0, maxDistricts)) : city.districts;
    for (const dist of districts) {
      const distName = String(dist.name).trim();
      const districtId = await getOrCreateDistrictId(cityId, distName);
      if (districtId) districtKeyToId.set(`${cityName}|${distName}`, districtId);
      else {
        // eslint-disable-next-line no-console
        console.error("district error:", distName, "id alınamadı (city:", cityName, ", id:", cityId, ")");
      }
    }
  }

  // 3) Mahalleler
  for (const city of citiesToProcess) {
    const cityName = String(city.name).trim();
    const districts = typeof maxDistricts === 'number' ? city.districts.slice(0, Math.max(0, maxDistricts)) : city.districts;
    for (const dist of districts) {
      const distName = String(dist.name).trim();
      const districtId = districtKeyToId.get(`${cityName}|${distName}`);
      if (!districtId) continue;
      if (Array.isArray(dist.neighborhoods)) {
        const neighborhoods = typeof maxNeighborhoods === 'number' ? dist.neighborhoods.slice(0, Math.max(0, maxNeighborhoods)) : dist.neighborhoods;
        for (const n of neighborhoods) {
          const nbName = String(n.name).trim();
          await createNeighborhoodIfNotExists(districtId, nbName);
        }
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log("Lokasyon seed tamamlandı.");
  process.exit(0);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


