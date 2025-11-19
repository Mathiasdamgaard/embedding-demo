import {
  pgTable,
  text,
  vector,
  decimal,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    category: text("category").notNull(),
    brand: text("brand"),
    imageUrl: text("image_url"),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);

export const materials = pgTable(
  "materials",
  {
    id: integer("id").primaryKey(),
    ea_number: text("ea_number").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    specs: jsonb("specs").notNull(),
    time_estimation: decimal("time_estimation", {
      precision: 10,
      scale: 2,
    }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => [
    index("materialEmbeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);