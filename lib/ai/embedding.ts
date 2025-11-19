import { createAzure } from "@ai-sdk/azure";
import { embed } from "ai";
import { db } from "@/lib/db/drizzle";
import { materials, products } from "@/lib/db/schema";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";

export const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

export const generateEmbedding = async (value: string) => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: azure.textEmbeddingModel(process.env.OPENAI_API_EMBEDDING_MODEL!),
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userEmbedding = await generateEmbedding(userQuery);

  const similarity = sql<number>`1 - (${cosineDistance(
    products.embedding,
    userEmbedding
  )})`;

  const similarProducts = await db
    .select({
      id: products.id,
      name: products.title,
      price: products.price,
      description: products.description,
      imageUrl: products.imageUrl,
      similarity,
    })
    .from(products)
    .where(gt(similarity, 0.5)) 
    .orderBy(desc(similarity))
    .limit(4);

  return similarProducts;
};

export const findSimilarMaterials = async (query: string) => {
  const userEmbedding = await generateEmbedding(query);

  const similarity = sql<number>`1 - (${cosineDistance(
    materials.embedding,
    userEmbedding
  )})`;

  const results = await db
    .select({
      id: materials.id,
      ea_number: materials.ea_number,
      name: materials.name,
      description: materials.description,
      category: materials.category,
      time_estimation: materials.time_estimation,
      specs: materials.specs,
      similarity,
    })
    .from(materials)
    .orderBy(desc(similarity))
    .limit(3); 

  return results;
};
