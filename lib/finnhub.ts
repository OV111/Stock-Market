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
};

export async function fetchQuote(symbol: string): Promise<Quote | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`,
    );
    if (!response.ok) return null;

    const data = await response.json();
    return {
      symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
    };
  } catch (err) {
    console.error(`Failed to fetch quote for ${symbol}:`, err);
    return null;
  }
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const quotes = await Promise.all(symbols.map(fetchQuote));
  return quotes.filter((q): q is Quote => q != null && q.price !== 0 && q.changePercent != null);
}
