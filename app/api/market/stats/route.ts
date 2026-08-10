import { NextResponse } from "next/server";

const INDICES = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "NASDAQ" },
  { symbol: "DIA", label: "DOW" },
  { symbol: "IWM", label: "Russell 2000" },
];

export async function GET(): Promise<NextResponse> {
  try {
    const stats = await Promise.all(
      INDICES.map(async ({ symbol, label }) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
          );
          if (!response.ok) return null;
          const data = await response.json();
          return {
            symbol,
            label,
            price: data.c,
            change: data.d,
            changePercent: data.dp,
          };
        } catch (err) {
          console.error(`Failed to fetch quote for ${symbol}:`, err);
          return null;
        }
      }),
    );

    const filtered = stats.filter((s) => s != null && s.price !== 0);
    return NextResponse.json(filtered);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
