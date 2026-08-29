import { NextResponse } from "next/server";
import { searchSymbols } from "@/lib/finnhub";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (!query) return NextResponse.json([]);

    const results = await searchSymbols(query);
    return NextResponse.json(results);
  } catch (err) {
    console.error("[search:GET]", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
