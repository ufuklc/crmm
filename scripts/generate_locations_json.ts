import { readFileSync, writeFileSync } from "node:fs";

// Bu script, turkey-city-data/dump.sql içindeki INSERT ifadelerinden
// şehir -> ilçe -> mahalle hiyerarşisini çıkarıp turkiye-lokasyon.json üretir.

type CityRow = { id: number; name: string };
type DistrictRow = { id: number; city_id: number; name: string };
type NeighborhoodRow = { id: number; district_id: number; name: string };

function parseInserts(sql: string, table: string, columns: string[]): string[] {
  // INSERT INTO  "district"   ( "id", "city_id", "name", "city_name" ) VALUES (...)
  const tableRegex = new RegExp(
    `INSERT\\s+INTO\\s+"?${table}"?\\s*\\(([^)]+)\\)\\s*VALUES\\s*\\(([^;]+?)\\)`,
    "gi",
  );
  const rows: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = tableRegex.exec(sql))) {
    // Çoklu VALUES desteği yok; dump tekli INSERT satırları kullanıyor.
    rows.push(m[2]);
  }
  return rows;
}

function splitCsvRespectingQuotes(values: string): string[] {
  // Basit bir CSV ayrıştırıcı: parantez içindeki tek satırlık VALUES için yeterli
  const out: string[] = [];
  let current = "";
  let inQuote = false;
  for (let i = 0; i < values.length; i++) {
    const ch = values[i];
    if (ch === "'") {
      inQuote = !inQuote;
      current += ch;
    } else if (ch === "," && !inQuote) {
      out.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) out.push(current.trim());
  return out.map((s) => s.replace(/^'|'$/g, ""));
}

function main(): void {
  const sql = readFileSync("turkey-city-data/dump.sql", "utf-8");

  // City
  const cityRows = parseInserts(sql, "city", ["id", "name", "plate_number", "phone_code", "row_number"]).map(
    (vals) => splitCsvRespectingQuotes(vals),
  );
  const cities: Record<number, CityRow> = Object.create(null);
  for (const row of cityRows) {
    const id = Number(row[0]);
    const name = row[1];
    cities[id] = { id, name };
  }

  // District
  const districtRows = parseInserts(sql, "district", ["id", "city_id", "name", "city_name"]).map((vals) =>
    splitCsvRespectingQuotes(vals),
  );
  const districts: Record<number, DistrictRow> = Object.create(null);
  const cityIdToDistricts: Record<number, DistrictRow[]> = Object.create(null);
  for (const row of districtRows) {
    const id = Number(row[0]);
    const city_id = Number(row[1]);
    const name = row[2];
    const d: DistrictRow = { id, city_id, name };
    districts[id] = d;
    (cityIdToDistricts[city_id] ||= []).push(d);
  }

  // Neighborhood
  const neighborhoodRows = parseInserts(sql, "neighbourhood", ["id", "name", "area_name", "postal_code", "district_id"]).map(
    (vals) => splitCsvRespectingQuotes(vals),
  );
  const districtIdToNeighborhoods: Record<number, NeighborhoodRow[]> = Object.create(null);
  for (const row of neighborhoodRows) {
    const id = Number(row[0]);
    const name = row[1];
    const district_id = Number(row[4]);
    const n: NeighborhoodRow = { id, district_id, name };
    (districtIdToNeighborhoods[district_id] ||= []).push(n);
  }

  // Hiyerarşi: city -> districts -> neighborhoods
  const orderedCityIds = Object.values(cities)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
    .map((c) => c.id);

  const result = orderedCityIds.map((cityId) => {
    const city = cities[cityId]!;
    const dists = (cityIdToDistricts[cityId] || []).sort((a, b) => a.name.localeCompare(b.name, "tr"));
    return {
      name: city.name,
      districts: dists.map((d) => ({
        name: d.name,
        neighborhoods: (districtIdToNeighborhoods[d.id] || [])
          .sort((a, b) => a.name.localeCompare(b.name, "tr"))
          .map((n) => ({ name: n.name })),
      })),
    };
  });

  writeFileSync("turkiye-lokasyon.json", JSON.stringify(result, null, 2), "utf-8");
  // eslint-disable-next-line no-console
  console.log(`turkiye-lokasyon.json yazıldı. Şimdi: npm run seed:locations`);
}

main();


