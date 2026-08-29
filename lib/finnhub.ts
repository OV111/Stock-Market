import { singleflight, TTL } from "@/lib/singleflight";

export const STOCK_SYMBOLS: string[] = [
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

export type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
};

export async function fetchQuote(symbol: string): Promise<Quote | null> {
  return singleflight(`quote:${symbol}`, async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
        { next: { revalidate: TTL.QUOTE } },
      );
      if (!response.ok) return null;

      const data = await response.json();
      return {
        symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        open: data.o,
        high: data.h,
        low: data.l,
        previousClose: data.pc,
      };
    } catch (err) {
      console.error(`Failed to fetch quote for ${symbol}:`, err);
      return null;
    }
  });
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const quotes = await Promise.all(symbols.map(fetchQuote));
  return quotes.filter((q): q is Quote => q != null && q.price !== 0 && q.changePercent != null);
}

export type NewsItem = {
  symbol: string;
  source: string;
  headline: string;
  summary: string;
  url: string;
  datetime: number; // unix seconds, as Finnhub returns it
};

export async function fetchCompanyNews(symbol: string): Promise<NewsItem[]> {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

  // Date range is part of the key — it's part of what varies the response.
  return singleflight(`news:${symbol}:${from}:${to}`, async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`,
        { next: { revalidate: TTL.NEWS } },
      );
      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      return data.map((item) => ({
        symbol,
        source: item.source,
        headline: item.headline,
        summary: item.summary,
        url: item.url,
        datetime: item.datetime,
      }));
    } catch (err) {
      console.error(`Failed to fetch news for ${symbol}:`, err);
      return [];
    }
  });
}

export async function fetchNewsForSymbols(symbols: string[]): Promise<NewsItem[]> {
  const results = await Promise.all(symbols.map(fetchCompanyNews));
  return results
    .flat()
    .sort((a, b) => b.datetime - a.datetime);
}

export type SymbolSearchResult = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
};

export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  // Normalize the key so "AAPL", "aapl" and " aapl " share one cache entry —
  // a debounced search box produces exactly these near-duplicate keys.
  const normalized = query.trim().toLowerCase();

  return singleflight(`search:${normalized}`, async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${process.env.FINNHUB_API_KEY}`,
        { next: { revalidate: TTL.SEARCH } },
      );
      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data?.result)) return [];

      return data.result.map((item: Record<string, string>) => ({
        symbol: item.symbol,
        displaySymbol: item.displaySymbol,
        description: item.description,
        type: item.type,
      }));
    } catch (err) {
      console.error(`Failed to search symbols for "${query}":`, err);
      return [];
    }
  });
}

export type CompanyProfile = {
  symbol: string;
  name: string;
  logo: string;
  industry: string;
  marketCapitalization: number;
  currency: string;
  exchange: string;
};

export async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  return singleflight(`profile:${symbol}`, async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
        { next: { revalidate: TTL.PROFILE } },
      );
      if (!response.ok) return null;

      const data = await response.json();
      if (!data || !data.name) return null;

      return {
        symbol,
        name: data.name,
        logo: data.logo,
        industry: data.finnhubIndustry,
        marketCapitalization: data.marketCapitalization,
        currency: data.currency,
        exchange: data.exchange,
      };
    } catch (err) {
      console.error(`Failed to fetch company profile for ${symbol}:`, err);
      return null;
    }
  });
}

export type CandleBar = {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/**
 * Daily OHLC candles for one symbol between two unix-seconds timestamps.
 * Returns `null` (distinct from `[]`) when the request itself failed or the
 * plan doesn't have access — Finnhub's `/stock/candle` endpoint is gated on
 * paid plans for US equities on some free keys, and this needs to be
 * distinguishable from "the request succeeded, there's just no data."
 */
export async function fetchDailyCandles(
  symbol: string,
  fromUnix: number,
  toUnix: number,
): Promise<CandleBar[] | null> {
  // Bucket the range to the day. Callers derive `toUnix` from Date.now(), so a
  // raw-seconds key would be unique on every call and never hit cache.
  const fromDay = Math.floor(fromUnix / 86_400);
  const toDay = Math.floor(toUnix / 86_400);

  return singleflight(`candle:${symbol}:${fromDay}:${toDay}`, async () => {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${fromUnix}&to=${toUnix}&token=${process.env.FINNHUB_API_KEY}`,
        { next: { revalidate: TTL.CANDLE } },
      );
      if (!response.ok) {
        console.error(`[finnhub:candle] ${symbol} request failed: ${response.status}`);
        return null;
      }

      const data = await response.json();

      if (data.s === "no_data") return [];
      if (data.s !== "ok") {
        console.error(`[finnhub:candle] ${symbol} not accessible on this plan:`, data);
        return null;
      }

      const bars: CandleBar[] = data.t.map((unixSeconds: number, i: number) => ({
        timestamp: new Date(unixSeconds * 1000),
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      }));

      return bars;
    } catch (err) {
      console.error(`Failed to fetch candles for ${symbol}:`, err);
      return null;
    }
  });
}
