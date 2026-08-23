import { NextResponse } from "next/server";
import {
  fetchQuote,
  fetchCompanyProfile,
  fetchCompanyNews,
  fetchDailyCandles,
} from "@/lib/finnhub";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> },
): Promise<NextResponse> {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const to = Math.floor(Date.now() / 1000);
    const from = to - 90 * 86_400;

    const [quote, profile, news, candles] = await Promise.all([
      fetchQuote(upperSymbol),
      fetchCompanyProfile(upperSymbol),
      fetchCompanyNews(upperSymbol),
      fetchDailyCandles(upperSymbol, from, to),
    ]);

    return NextResponse.json({ quote, profile, news, candles });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
