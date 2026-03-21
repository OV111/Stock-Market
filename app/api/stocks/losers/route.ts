import { NextResponse } from "next/server";

const SYMBOLS: string[] = [
  "AAPL",
  "MSFT",
  "NVDA",
  "GOOGL",
  "AMZN",
  "META",
  "TSLA",
  "AMD",
  "NFLX",
  "PYPL",
  "INTC",
  "CRM",
  "ORCL",
  "UBER",
  "SHOP",
  "SNAP",
  "SPOT",
  "COIN",
  "SQ",
];

export async function GET(): Promise<NextResponse> {
  try {
    const quotes = await Promise.all(
      SYMBOLS.map(async (symbol) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
        );

        if (!response.ok) {
          return;
        }
        const request = await response.json();
        return {
          symbol,
          price: request.c,
          change: request.d,
          changePercent: request.dp,
        };
      }),
    );
    const losers = quotes
      .filter((q) => q != null && q.price !== 0 && q.changePercent != null)
      .sort((a, b) => a?.changePercent - b?.changePercent)
      .slice(0, 8);
    return NextResponse.json(losers);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
