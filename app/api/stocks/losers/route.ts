// app/api/stocks/losers/route.ts
import { NextResponse, NextRequest } from 'next/server';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 8;

    const params = new URLSearchParams({
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: '100',
      page: '1',
      price_change_percentage: '24h',
      precision: 'full',
    });

    const response = await fetch(`${BASE_URL}/coins/markets?${params}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`[coingecko] losers failed: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch losers' },
        { status: response.status }
      );
    }

    const markets = await response.json();

    const losers = markets
      .filter((coin: any) => coin.price_change_percentage_24h !== null)
      .sort((a: any, b: any) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, limit)
      .map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        price: coin.current_price,
        change: coin.price_change_24h || 0,
        changePercent: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap,
        volume: coin.total_volume,
      }));

    return NextResponse.json(losers);
  } catch (error) {
    console.error('[coingecko] losers error:', error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
}