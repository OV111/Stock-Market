// app/api/market/stats/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/global`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`[coingecko] global stats failed: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch market stats' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const stats = data.data;

    return NextResponse.json({
      totalMarketCap: stats.total_market_cap?.usd || 0,
      totalVolume24h: stats.total_volume?.usd || 0,
      btcDominance: stats.market_cap_percentage?.btc || 0,
      ethDominance: stats.market_cap_percentage?.eth || 0,
      activeCryptocurrencies: stats.active_cryptocurrencies || 0,
      markets: stats.markets || 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[coingecko] global stats error:', error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
}