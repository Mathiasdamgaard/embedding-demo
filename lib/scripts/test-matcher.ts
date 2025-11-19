import { db } from "@/lib/db/drizzle";
import { materials } from "@/lib/db/schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embed } from "ai";
import { azure } from "@/lib/ai/embedding";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🧪 Starting Akkord+ Material Matching Test...\n");

  const dataPath = path.join(process.cwd(), "lib", "db", "materials.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const { unknown_materials } = JSON.parse(rawData);

  let passed = 0;

  for (const unknown of unknown_materials) {
    console.log(`---------------------------------------------------`);
    console.log(`🔍 Testing: ${unknown.test_id}`);
    console.log(`   Input: "${unknown.input_name}"`);
    console.log(`   Desc:  "${unknown.description}"`);

    // 1. Simulate the Agent Logic: Create a search string
    // In a real app, an LLM might clean this string first.
    // For now, we just search with what we have.
    const query = `Material: ${unknown.input_name}\nDescription: ${unknown.description}`;

    // 2. Generate Embedding for the "Unknown" item
    const { embedding } = await embed({
      model: azure.textEmbeddingModel(process.env.OPENAI_API_EMBEDDING_MODEL!),
      value: query,
    });

    // 3. Search the "Gold" Database
    const similarity = sql<number>`1 - (${cosineDistance(
      materials.embedding,
      embedding
    )})`;

    const results = await db
      .select({
        id: materials.id,
        name: materials.name,
        time: materials.time_estimation,
        similarity: similarity,
      })
      .from(materials)
      .orderBy(desc(similarity))
      .limit(3);

    // 4. Verify Results
    const topMatch = results[0];
    const isMatch = topMatch?.id === unknown.expected_match_id;

    if (isMatch) {
      console.log(`✅ SUCCESS!`);
      console.log(`   Matched: "${topMatch.name}" (ID: ${topMatch.id})`);
      console.log(`   Confidence: ${(topMatch.similarity * 100).toFixed(2)}%`);
      console.log(`   Time Estimation Found: ${topMatch.time} mins`);
      passed++;
    } else {
      console.log(`❌ FAILED.`);
      console.log(`   Expected ID: ${unknown.expected_match_id}`);
      console.log(`   Got: "${topMatch?.name}" (ID: ${topMatch?.id})`);
      console.log(`   Confidence: ${(topMatch?.similarity * 100).toFixed(2)}%`);
    }
  }

  console.log(`\n---------------------------------------------------`);
  console.log(`📊 Test Summary: ${passed}/${unknown_materials.length} Passed`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
