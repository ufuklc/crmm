import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
// .env.local tercih edilir; yoksa .env
if (existsSync(".env.local")) {
  loadEnv({ path: ".env.local" });
} else {
  loadEnv();
}
import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
  // eslint-disable-next-line no-console
  console.error("Supabase env değişkenleri eksik");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey ?? (anonKey as string));

const createdBy: string | null = process.env.SEED_CREATED_BY ?? null;

type InsertResult = { success: number; fail: number; errors: string[] };

async function insert(table: string, rows: Record<string, unknown>[]): Promise<InsertResult> {
  let success = 0;
  let fail = 0;
  const errors: string[] = [];
  for (const row of rows) {
    const { error } = await supabase.from(table).insert(row);
    if (error) {
      fail++;
      errors.push(error.message);
    } else {
      success++;
    }
  }
  return { success, fail, errors };
}

async function main(): Promise<void> {
  // faker.locale = "tr"; // locale deprecated in newer faker versions

  // 5 müşteri
  const customers = Array.from({ length: 5 }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    phone: faker.phone.number(),
    cash_or_loan: faker.helpers.arrayElement(["Nakit", "Kredi"]),
    created_by: createdBy,
  }));

  const customersRes = await insert("customers", customers);
  // eslint-disable-next-line no-console
  console.log("customers:", customersRes);

  // Müşterileri çek
  const { data: customerRows } = await supabase
    .from("customers")
    .select("id")
    .limit(5);

  const customerIds: string[] = (customerRows ?? []).map((r) => r.id as string);

  // Her müşteri için 5 varlık ve 5 istek
  const propertyTypes = ["Daire", "İş Yeri", "Arsa"] as const;
  const listingTypes = ["Satılık", "Kiralık"] as const;

  const properties: Record<string, unknown>[] = [];
  const requests: Record<string, unknown>[] = [];

  for (const customerId of customerIds) {
    for (let i = 0; i < 5; i++) {
      const type = faker.helpers.arrayElement(propertyTypes);
      const listing_type = type === "Arsa" ? "Satılık" : faker.helpers.arrayElement(listingTypes);
      const city = faker.location.city();
      const district = faker.location.county();
      const neighborhood = faker.location.street();
      const gross_m2 = faker.number.int({ min: 40, max: 250 });
      const net_m2 = faker.number.int({ min: 30, max: gross_m2 });
      const price = faker.number.int({ min: 500000, max: 10000000 });

      properties.push({
        type,
        listing_type,
        city,
        district,
        neighborhood,
        price,
        gross_m2,
        net_m2,
        rooms: type !== "Arsa" ? faker.number.int({ min: 1, max: 6 }) : null,
        heating: type !== "Arsa" ? faker.helpers.arrayElement(["Doğalgaz", "Klima", "Soba"]) : null,
        building_age_range: null,
        floor: faker.number.int({ min: 0, max: 20 }),
        credit: listing_type === "Satılık" ? faker.datatype.boolean() : null,
        aspect: type === "Daire" ? faker.helpers.arrayElements(["Kuzey", "Güney", "Doğu", "Batı"], { min: 1, max: 3 }) : null,
        ensuite_bath: type === "Daire" ? faker.datatype.boolean() : null,
        pool: type === "Daire" ? faker.datatype.boolean() : null,
        dressing_room: type === "Daire" ? faker.datatype.boolean() : null,
        furnished: type === "Daire" ? faker.datatype.boolean() : null,
        bathroom_count: type === "Daire" ? faker.number.int({ min: 1, max: 3 }) : null,
        balcony: type === "Daire" ? faker.datatype.boolean() : null,
        in_site: type === "Daire" ? faker.datatype.boolean() : null,
        customer_id: customerId,
        created_by: createdBy,
      });

      requests.push({
        customer_id: customerId,
        type,
        listing_type,
        city,
        district,
        neighborhood,
        min_price: faker.number.int({ min: 300000, max: price }),
        max_price: faker.number.int({ min: price, max: price + 3000000 }),
        min_size: faker.number.int({ min: 40, max: 100 }),
        max_size: faker.number.int({ min: 100, max: 300 }),
        rooms: type !== "Arsa" ? faker.number.int({ min: 1, max: 5 }) : null,
        fulfilled: false,
        created_by: createdBy,
      });
    }
  }

  const propertiesRes = await insert("properties", properties);
  // eslint-disable-next-line no-console
  console.log("properties:", propertiesRes);

  const requestsRes = await insert("customer_requests", requests);
  // eslint-disable-next-line no-console
  console.log("customer_requests:", requestsRes);

  // Basit portföy sahibi verileri
  const portfolioOwners = Array.from({ length: 5 }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    phone: faker.phone.number(),
    created_by: createdBy,
  }));
  const portfolioRes = await insert("portfolio_owners", portfolioOwners);
  // eslint-disable-next-line no-console
  console.log("portfolio_owners:", portfolioRes);
}

// Çalıştır
main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


