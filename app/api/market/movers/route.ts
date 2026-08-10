import { NextResponse } from "next/server";
import { STOCK_SYMBOLS, fetchQuotes } from "@/lib/finnhub";

export async function GET(): Promise<NextResponse> {
  try {
    const quotes = await fetchQuotes(STOCK_SYMBOLS);
    const sorted = [...quotes].sort((a, b) => b.changePercent - a.changePercent);

    const gainers = sorted.slice(0, 8);
    const losers = sorted.slice(-8).reverse();

    return NextResponse.json({ gainers, losers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch market movers" }, { status: 500 });
  }
}
