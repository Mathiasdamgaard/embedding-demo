import { NextResponse } from "next/server";
import { findRelevantContent } from "@/lib/ai/embedding";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing 'query' field." },
        { status: 400 }
      );
    }

    const similarProducts = await findRelevantContent(query);

    return NextResponse.json({ results: similarProducts });
  } catch (error) {
    console.error("Semantic Search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform semantic search." },
      { status: 500 }
    );
  }
}