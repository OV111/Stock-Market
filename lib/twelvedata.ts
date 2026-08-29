import { singleflight, TTL } from "@/lib/singleflight";
import type { CandleBar } from "@/lib/finnhub";

/**
 * Twelve Data — OHLC fallback for symbols Finnhub's plan won't serve
 * candles for. Free tier: 8 credits/min, 800/day (twelvedata.com/pricing,
 * checked 2026-08-23 — verify before relying on it, free-tier limits move).
 * Same CandleBar shape as lib/finnhub.ts so callers don't care which
 * provider actually answered.
 */

const BASE_URL = "https://api.twelvedata.com/time_series";

type TwelveDataBar = {
  datetime: string; // "2026-08-01"
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

type TwelveDataResponse =
  | { status: "ok"; values: TwelveDataBar[] }
  | { status: "error"; message: string; code?: number };

/**
 * Daily OHLC candles for one symbol between two unix-seconds timestamps.
 * Same null-vs-empty contract as fetchDailyCandles in lib/finnhub.ts:
 * `null` means the request failed or the key/plan can't serve this, `[]`
 * means the request succeeded with nothing in range.
 */
export async function fetchDailyCandlesFromTwelveData(
  symbol: string,
  fromUnix: number,
  toUnix: number,
): Promise<CandleBar[] | null> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    // Not configured — treat as unavailable, not an error. Callers already
    // handle `null` as "try the next source" or "give up gracefully."
    return null;
  }

  const fromDay = Math.floor(fromUnix / 86_400);
  const toDay = Math.floor(toUnix / 86_400);

  return singleflight(`twelvedata:candle:${symbol}:${fromDay}:${toDay}`, async () => {
    try {
      const startDate = new Date(fromUnix * 1000).toISOString().slice(0, 10);
      const endDate = new Date(toUnix * 1000).toISOString().slice(0, 10);

      const url =
        `${BASE_URL}?symbol=${symbol}&interval=1day` +
        `&start_date=${startDate}&end_date=${endDate}` +
        `&apikey=${apiKey}`;

      const response = await fetch(url, {
        next: { revalidate: TTL.CANDLE },
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) {
        console.error(`[twelvedata:candle] ${symbol} request failed: ${response.status}`);
        return null;
      }

      const data: TwelveDataResponse = await response.json();

      if (data.status === "error") {
        // Bad symbol, exhausted quota, or an invalid key all land here.
        console.error(`[twelvedata:candle] ${symbol} error:`, data.message);
        return null;
      }

      if (!Array.isArray(data.values) || data.values.length === 0) return [];

      // Twelve Data returns most-recent-first; normalize to chronological
      // order so callers never have to guess which direction they got.
      const bars: CandleBar[] = data.values
        .map((bar) => ({
          timestamp: new Date(`${bar.datetime}T00:00:00Z`),
          open: Number(bar.open),
          high: Number(bar.high),
          low: Number(bar.low),
          close: Number(bar.close),
          volume: Number(bar.volume),
        }))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      return bars;
    } catch (err) {
      console.error(`Failed to fetch Twelve Data candles for ${symbol}:`, err);
      return null;
    }
  });
}
