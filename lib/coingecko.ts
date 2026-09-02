import { singleflight, TTL } from "@/lib/singleflight";
import { isCryptoSymbol } from "@/constants/cryptoAssets";
import type { Quote } from "@/lib/finnhub";

type CoinGeckoMarket = {
  id: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  high_24h: number | null;
  low_24h: number | null;
};

export type CryptoMover = {
  symbol: string;
  name: string;
  image: string;
  price: number;
  change: number;
  changePercent: number;
};

const BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Fetches crypto market data in one request. CoinGecko's markets endpoint is
 * intentionally separate from Finnhub: its 24-hour fields are crypto-native
 * and it avoids relying on exchange-specific ticker syntax.
 */
export async function fetchCryptoQuotes(symbols: string[]): Promise<Quote[]> {
  const cryptoSymbols = [...new Set(symbols.filter(isCryptoSymbol))];
  if (cryptoSymbols.length === 0) return [];

  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    console.error("[coingecko] COINGECKO_API_KEY is not configured");
    return [];
  }

  const ids = cryptoSymbols.map((symbol) => symbol.slice("CRYPTO:".length));
  const cacheKey = [...ids].sort().join(",");

  return singleflight(`coingecko:markets:${cacheKey}`, async () => {
    try {
      const params = new URLSearchParams({
        vs_currency: "usd",
        ids: ids.join(","),
        price_change_percentage: "24h",
        precision: "full",
      });
      const response = await fetch(`${BASE_URL}/coins/markets?${params}`, {
        headers: { "x-cg-demo-api-key": apiKey },
        next: { revalidate: TTL.QUOTE },
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) {
        console.error(`[coingecko] markets request failed: ${response.status}`);
        return [];
      }

      const markets: CoinGeckoMarket[] = await response.json();
      if (!Array.isArray(markets)) return [];

      const byId = new Map(markets.map((market) => [market.id, market]));
      return cryptoSymbols.flatMap((symbol) => {
        const market = byId.get(symbol.slice("CRYPTO:".length));
        if (
          !market ||
          market.current_price === null ||
          market.current_price <= 0
        )
          return [];

        return [
          {
            symbol,
            image: market.image,
            price: market.current_price,
            change: market.price_change_24h ?? 0,
            changePercent: market.price_change_percentage_24h ?? 0,
            open: 0,
            high: market.high_24h ?? market.current_price,
            low: market.low_24h ?? market.current_price,
            previousClose: 0,
          },
        ];
      });
    } catch (err) {
      console.error("[coingecko] failed to fetch markets", err);
      return [];
    }
  });
}

/**
 * Ranks the 100 largest crypto assets by their 24-hour percentage move. This
 * is deliberately not presented as a market-wide claim: a free market-data
 * screen has a bounded universe, and the UI labels that universe explicitly.
 */
export async function fetchTopCryptoMovers(
  limit = 5,
): Promise<{ gainers: CryptoMover[]; losers: CryptoMover[] }> {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    console.error("[coingecko] COINGECKO_API_KEY is not configured");
    return { gainers: [], losers: [] };
  }

  return singleflight("coingecko:top-movers", async () => {
    try {
      const params = new URLSearchParams({
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: "100",
        page: "1",
        price_change_percentage: "24h",
        precision: "full",
      });
      const response = await fetch(`${BASE_URL}/coins/markets?${params}`, {
        headers: { "x-cg-demo-api-key": apiKey },
        next: { revalidate: TTL.QUOTE },
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) {
        console.error(
          `[coingecko] top movers request failed: ${response.status}`,
        );
        return { gainers: [], losers: [] };
      }

      const markets: CoinGeckoMarket[] = await response.json();
      if (!Array.isArray(markets)) return { gainers: [], losers: [] };

      const movers = markets.flatMap((market) => {
        if (
          market.current_price === null ||
          market.price_change_percentage_24h === null
        )
          return [];
        return [
          {
            symbol: market.id,
            name: market.name,
            image: market.image,
            price: market.current_price,
            change: market.price_change_24h ?? 0,
            changePercent: market.price_change_percentage_24h,
          },
        ];
      });
      const sorted = [...movers].sort(
        (a, b) => b.changePercent - a.changePercent,
      );
      return {
        gainers: sorted.slice(0, limit),
        losers: sorted.slice(-limit).reverse(),
      };
    } catch (err) {
      console.error("[coingecko] failed to fetch top movers", err);
      return { gainers: [], losers: [] };
    }
  });
}
