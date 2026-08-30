import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Supabase credentials (from App.tsx)
const SUPABASE_URL = "https://vxscfljgtmddnmzmwitq.supabase.co";
const SUPABASE_KEY = "sb_publishable_3Im_1dgtrjvTitchLnjIzA_Vu3RaDPw";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load master products data
const masterProducts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "master_products.json"), "utf-8")
);

console.log(`\n📊 Loaded ${masterProducts.length} products from Master.xlsx\n`);

async function fixDatabase() {
  let updated = 0;
  let failed = 0;
  let skipped = 0;
  const errors = [];

  console.log("🔄 Updating database with correct specifications...\n");

  for (const product of masterProducts) {
    try {
      if (!product.barcode) {
        skipped++;
        continue;
      }

      const { error } = await sb
        .from("master_data")
        .update({
          name_en: product.name_en || "",
          ram: product.ram || "",
          rom: product.rom || "",
          connectivity: product.connectivity || "",
        })
        .eq("barcode", product.barcode.toString());

      if (error) {
        console.error(
          `  ❌ Barcode ${product.barcode}: ${error.message}`
        );
        errors.push({ barcode: product.barcode, error: error.message });
        failed++;
      } else {
        updated++;
        if (updated % 50 === 0) {
          console.log(`  ✓ Updated ${updated} products...`);
        }
      }
    } catch (err) {
      console.error(
        `  ❌ Exception for barcode ${product.barcode}: ${err.message}`
      );
      errors.push({ barcode: product.barcode, error: err.message });
      failed++;
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`DATABASE UPDATE COMPLETE`);
  console.log(`${"=".repeat(50)}\n`);
  console.log(`✅ Successfully updated: ${updated} products`);
  console.log(`❌ Failed: ${failed} products`);
  console.log(`⊘ Skipped: ${skipped} products`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  First 5 errors:`);
    errors.slice(0, 5).forEach(e => {
      console.log(`  - Barcode ${e.barcode}: ${e.error}`);
    });
  }
  
  console.log(`\n✨ Database fix complete!\n`);
}

console.log(`${"=".repeat(50)}`);
console.log(`JUMIA SKU CREATOR - DATABASE FIX`);
console.log(`${"=".repeat(50)}`);

fixDatabase().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
