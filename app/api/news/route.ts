import { NextResponse } from "next/server";
import { STOCK_SYMBOLS, fetchNewsForSymbols } from "@/lib/finnhub";

export async function GET(): Promise<NextResponse> {
  try {
    // TODO: once Watchlist exists, scope this to the user's watchlist symbols
    // instead of the global STOCK_SYMBOLS list.
    const news = await fetchNewsForSymbols(STOCK_SYMBOLS.slice(0, 6));
    return NextResponse.json(news.slice(0, 20));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
