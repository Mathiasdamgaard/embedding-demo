/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./drizzle";
import { materials } from "./schema";
import { embedMany } from "ai";
import { azure } from "../ai/embedding";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🏗️  Seeding Materials for Akkord+ PoV...");

  const dataPath = path.join(process.cwd(), "lib", "db", "materials.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const { database_materials } = JSON.parse(rawData);

  console.log(`🌱 Found ${database_materials.length} materials.`);

  // Create the text blob for embedding
  // We intentionally combine Name + Description + Specs keys/values
  const valuesToEmbed = database_materials.map((m: any) => {
    const specsString = Object.entries(m.specs)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
    return `Material: ${m.name}\nDescription: ${m.description}\nCategory: ${m.category}\nSpecs: ${specsString}`;
  });

  // Generate Embeddings
  const { embeddings } = await embedMany({
    model: azure.textEmbeddingModel(process.env.OPENAI_API_EMBEDDING_MODEL!),
    values: valuesToEmbed,
  });

  console.log(`✨ Generated ${embeddings.length} embeddings.`);

  const rows = database_materials.map((m: any, i: number) => ({
    id: m.id,
    ea_number: m.ea_number,
    name: m.name,
    description: m.description,
    category: m.category,
    specs: m.specs,
    time_estimation: m.time_estimation.toString(),
    price: m.price.toString(),
    embedding: embeddings[i],
  }));

  // Insert
  await db.insert(materials).values(rows).onConflictDoNothing();

  console.log("✅ Materials seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error seeding materials:", err);
  process.exit(1);
});
