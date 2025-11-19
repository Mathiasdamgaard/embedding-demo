import { NextResponse } from "next/server";
import { findSimilarMaterials } from "@/lib/ai/embedding";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    const results = await findSimilarMaterials(query);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Material Search Error:", error);
    return NextResponse.json(
      { error: "Failed to match materials." },
      { status: 500 }
    );
  }
}
