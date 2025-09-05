import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) loadEnv({ path: ".env.local" });
else loadEnv();

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main(): Promise<void> {
  const citiesCount = await supabase.from("cities").select("id", { count: "exact", head: true });
  // eslint-disable-next-line no-console
  console.log("cities count:", citiesCount.count ?? 0);

  const adana = await supabase.from("cities").select("id,name").eq("name", "ADANA").maybeSingle();
  // eslint-disable-next-line no-console
  console.log("ADANA:", adana.data ?? adana.error?.message);

  const sampleDistrictFk = await supabase
    .from("districts")
    .select("id,name,city_id")
    .limit(1)
    .maybeSingle();
  // eslint-disable-next-line no-console
  console.log("sample district:", sampleDistrictFk.data ?? sampleDistrictFk.error?.message);

  if (adana.data?.id) {
    const tryInsert = await supabase
      .from("districts")
      .insert({ name: "ZZ_TEST", city_id: adana.data.id })
      .select("id")
      .single();
    // eslint-disable-next-line no-console
    console.log("try insert district:", tryInsert.data ?? tryInsert.error?.message);
    if (tryInsert.data?.id) {
      await supabase.from("districts").delete().eq("id", tryInsert.data.id);
      // eslint-disable-next-line no-console
      console.log("cleanup ok");
    }
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});


