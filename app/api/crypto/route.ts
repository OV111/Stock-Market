import { NextResponse } from "next/server";

const CRYPTO_ASSETS = [
  { symbol: "BINANCE:BTCUSDT", name: "Bitcoin", ticker: "BTC" },
  { symbol: "BINANCE:ETHUSDT", name: "Ethereum", ticker: "ETH" },
  { symbol: "BINANCE:BNBUSDT", name: "BNB", ticker: "BNB" },
  { symbol: "BINANCE:SOLUSDT", name: "Solana", ticker: "SOL" },
  { symbol: "BINANCE:XRPUSDT", name: "XRP", ticker: "XRP" },
  { symbol: "BINANCE:DOGEUSDT", name: "Dogecoin", ticker: "DOGE" },
  { symbol: "BINANCE:ADAUSDT", name: "Cardano", ticker: "ADA" },
  { symbol: "BINANCE:AVAXUSDT", name: "Avalanche", ticker: "AVAX" },
  { symbol: "BINANCE:LINKUSDT", name: "Chainlink", ticker: "LINK" },
  { symbol: "BINANCE:DOTUSDT", name: "Polkadot", ticker: "DOT" },
  { symbol: "BINANCE:LTCUSDT", name: "Litecoin", ticker: "LTC" },
  { symbol: "BINANCE:MATICUSDT", name: "Polygon", ticker: "MATIC" },
];

export async function GET(): Promise<NextResponse> {
  try {
    const assets = await Promise.all(
      CRYPTO_ASSETS.map(async ({ symbol, name, ticker }) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.c) return null;
        return {
          symbol,
          ticker,
          name,
          price: data.c,
          change: data.d,
          changePercent: data.dp,
          high: data.h,
          low: data.l,
        };
      }),
    );

    const filtered = assets.filter((a) => a !== null && a.price !== 0);
    return NextResponse.json(filtered);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
