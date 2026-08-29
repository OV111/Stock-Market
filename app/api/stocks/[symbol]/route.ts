import { NextResponse } from "next/server";
import {
  fetchQuote,
  fetchCompanyProfile,
  fetchCompanyNews,
  fetchDailyCandles,
} from "@/lib/finnhub";
import { fetchInsiderFilings } from "@/lib/edgar";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> },
): Promise<NextResponse> {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const to = Math.floor(Date.now() / 1000);
    const from = to - 90 * 86_400;

    const [quote, profile, news, candles, insiderFilings] = await Promise.all([
      fetchQuote(upperSymbol),
      fetchCompanyProfile(upperSymbol),
      fetchCompanyNews(upperSymbol),
      fetchDailyCandles(upperSymbol, from, to),
      fetchInsiderFilings(upperSymbol),
    ]);

    return NextResponse.json({ quote, profile, news, candles, insiderFilings });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
