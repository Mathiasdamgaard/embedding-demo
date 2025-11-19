import { sql } from "drizzle-orm";
import { db } from "./drizzle";

async function main() {
  console.log("🔌 Enabling pgvector extension...");
  
  // This SQL command turns on the vector math capabilities
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
  
  console.log("✅ Vector extension enabled!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error enabling vector extension:", err);
  process.exit(1);
});