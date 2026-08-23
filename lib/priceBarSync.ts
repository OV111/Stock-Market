import { connectDB } from "@/lib/mongoose";
import PriceBar from "@/models/PriceBar";
import { fetchDailyCandles, type CandleBar } from "@/lib/finnhub";
import { fetchDailyCandlesFromTwelveData } from "@/lib/twelvedata";

export type SyncResult = {
  symbol: string;
  status: "ok" | "no_data" | "restricted" | "error";
  barsInserted: number;
  source?: "finnhub" | "twelvedata";
};

/**
 * Backfills daily OHLC bars for one symbol over the last `days` days.
 * Tries Finnhub first, falls back to Twelve Data when Finnhub returns `null`
 * (plan-gated or request failure) — the two providers share the CandleBar
 * shape, so nothing downstream needs to know which one actually answered.
 * Dedupes in application code (no unique index on time-series collections):
 * skips any bar whose timestamp already exists for this symbol before inserting.
 */
export async function syncPriceBars(symbol: string, days = 365): Promise<SyncResult> {
  await connectDB();

  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 86_400;

  let bars: CandleBar[] | null = await fetchDailyCandles(symbol, from, to);
  let source: SyncResult["source"] = "finnhub";

  if (bars === null) {
    bars = await fetchDailyCandlesFromTwelveData(symbol, from, to);
    source = "twelvedata";
  }

  if (bars === null) {
    return { symbol, status: "restricted", barsInserted: 0 };
  }
  if (bars.length === 0) {
    return { symbol, status: "no_data", barsInserted: 0, source };
  }

  const existing = await PriceBar.find(
    { symbol, timestamp: { $gte: new Date(from * 1000), $lte: new Date(to * 1000) } },
    { timestamp: 1 },
  ).lean();
  const existingTimestamps = new Set(existing.map((b) => b.timestamp.getTime()));

  const newBars = bars
    .filter((bar) => !existingTimestamps.has(bar.timestamp.getTime()))
    .map((bar) => ({ symbol, ...bar }));

  if (newBars.length > 0) {
    await PriceBar.insertMany(newBars);
  }

  return { symbol, status: "ok", barsInserted: newBars.length, source };
}

export async function syncPriceBarsForSymbols(
  symbols: string[],
  days = 365,
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  // Sequential, not Promise.all — avoids bursting past Finnhub's rate limit
  // when backfilling many symbols at once.
  for (const symbol of symbols) {
    results.push(await syncPriceBars(symbol, days));
  }
  return results;
}
