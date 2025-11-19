/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "./drizzle";
import { products } from "./schema";
import { embedMany } from "ai";
import { azure } from "../ai/embedding"; 
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const dataPath = path.join(process.cwd(), "lib", "db", "products.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const jsonData = JSON.parse(rawData);

  console.log(`🌱 Found ${jsonData.products.length} products. Generating embeddings...`);

  // Prepare the data objects
  const productsToProcess = jsonData.products.map((product: any) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    brand: product.brand,
    imageUrl: product.thumbnail,
    content: `Product: ${product.title}\nBrand: ${product.brand}\nCategory: ${product.category}\nDescription: ${product.description}\nPrice: $${product.price}`,
  }));

  const { embeddings } = await embedMany({
    model: azure.textEmbeddingModel(process.env.OPENAI_API_EMBEDDING_MODEL!),
    values: productsToProcess.map((p: any) => p.content.replace(/\n/g, " ")),
  });

  console.log(`✨ Generated ${embeddings.length} embeddings.`);

  const rows = productsToProcess.map((product: any, i: number) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    category: product.category,
    brand: product.brand,
    imageUrl: product.imageUrl,
    content: product.content, 
    embedding: embeddings[i],
  }));

  await db.insert(products).values(rows).onConflictDoNothing();

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error seeding database:", err);
  process.exit(1);
});