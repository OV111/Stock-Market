import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { syncPriceBarsForSymbols } from "@/lib/priceBarSync";

/**
 * Manual trigger for now — call this from the browser/Postman while logged in
 * to backfill OHLC bars and confirm whether the Finnhub key has candle access.
 * Body: { symbols: string[], days?: number }
 * Once this is proven working, this becomes a Vercel Cron job instead of a
 * user-triggered route (see Vision.md's "Systems Problems" section).
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { symbols, days } = body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { message: "symbols (non-empty array) is required" },
        { status: 400 },
      );
    }

    const results = await syncPriceBarsForSymbols(symbols, days ?? 365);

    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    console.error("[pricebars/sync:POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
