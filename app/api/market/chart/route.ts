import { NextRequest, NextResponse } from "next/server";
import { fetchDailyCandles } from "@/lib/finnhub";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!symbol || !from || !to) {
    return NextResponse.json(
      { error: "symbol, from, and to query params are required" },
      { status: 400 },
    );
  }

  try {
    const bars = await fetchDailyCandles(symbol, Number(from), Number(to));

    if (bars === null) {
      return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 502 });
    }

    return NextResponse.json({ bars });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
