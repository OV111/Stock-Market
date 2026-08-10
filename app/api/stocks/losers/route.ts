import { NextResponse } from "next/server";
import { STOCK_SYMBOLS, fetchQuotes } from "@/lib/finnhub";

export async function GET(): Promise<NextResponse> {
  try {
    const quotes = await fetchQuotes(STOCK_SYMBOLS);
    const losers = quotes.sort((a, b) => a.changePercent - b.changePercent).slice(0, 8);
    return NextResponse.json(losers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
