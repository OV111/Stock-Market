// data-collection/sources/coingecko-collector.ts
import { BaseCollector } from '../base-collector';
import { DataSourceConfig } from '../../config/data-sources';
import { dataSources } from '../../config';
import { MarketData, OHLCV } from '../../types';
import { DataCollectionError } from '../../utils/errors';

// YOUR existing functions (imported as-is)
import { fetchCryptoQuotes, fetchTopCryptoMovers } from '@/lib/coingecko';

export class CoinGeckoCollector extends BaseCollector {
  protected loadConfig(): DataSourceConfig {
    return dataSources.coingecko;
  }

  // ============================================================
  // 1. YOUR EXISTING fetchCryptoQuotes() – USED AS-IS
  // ============================================================
  async getQuotes(assetIds: string[]): Promise<MarketData[]> {
    const symbols = assetIds.map((id) => `CRYPTO:${id}`);
    const quotes = await fetchCryptoQuotes(symbols);

    return quotes.map((q) => ({
      priceUsd: q.price,
      marketCap: 0,
      fullyDilutedValuation: undefined,
      volume24h: 0,
      volumeToMarketCapRatio: 0,
      circulatingSupply: 0,
      totalSupply: 0,
      maxSupply: null,
      priceChange1h: 0,
      priceChange24h: q.change,
      priceChange7d: 0,
      priceChange30d: 0,
      priceChange90d: 0,
      priceChange1y: undefined,
      volatility30d: 0,
      volatility90d: 0,
      ath: 0,
      athDate: undefined,
      atl: 0,
      atlDate: undefined,
      marketCapRank: 0,
      dominance: undefined,
      source: 'coingecko',
      timestamp: new Date(),
      spread: undefined,
      symbol: q.symbol.replace('CRYPTO:', ''),
      name: q.symbol,
    } as MarketData));
  }

  // ============================================================
  // 2. FULL MARKET DATA – ✅ NO API KEY HEADER
  // ============================================================
  async getFullMarketData(assetId: string): Promise<MarketData> {
    // ✅ Strip CRYPTO: prefix if present
    const cleanId = assetId.replace(/^CRYPTO:/, '');
    const url = `${this.config.baseUrl}/coins/markets?vs_currency=usd&ids=${cleanId}&price_change_percentage=24h,7d,30d,90d&precision=full`;

    const response = await fetch(url, {
      // ✅ NO HEADERS – free tier works without API key
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new DataCollectionError(
        `Failed to fetch full market data: ${response.status}`,
        'coingecko',
        { assetId: cleanId, status: response.status }
      );
    }

    const data = await response.json();
    const item = data[0];
    if (!item) {
      throw new DataCollectionError(
        `No market data for ${cleanId}`,
        'coingecko',
        { assetId: cleanId },
        false
      );
    }

    return {
      priceUsd: item.current_price || 0,
      marketCap: item.market_cap || 0,
      fullyDilutedValuation: item.fully_diluted_valuation,
      volume24h: item.total_volume || 0,
      volumeToMarketCapRatio: (item.total_volume || 0) / (item.market_cap || 1),
      circulatingSupply: item.circulating_supply || 0,
      totalSupply: item.total_supply || item.circulating_supply || 0,
      maxSupply: item.max_supply || null,
      priceChange1h: item.price_change_percentage_1h_in_currency || 0,
      priceChange24h: item.price_change_percentage_24h || 0,
      priceChange7d: item.price_change_percentage_7d_in_currency || 0,
      priceChange30d: item.price_change_percentage_30d_in_currency || 0,
      priceChange90d: item.price_change_percentage_90d_in_currency || 0,
      priceChange1y: undefined,
      volatility30d: 0,
      volatility90d: 0,
      ath: item.ath || 0,
      athDate: item.ath_date ? new Date(item.ath_date) : undefined,
      atl: item.atl || 0,
      atlDate: item.atl_date ? new Date(item.atl_date) : undefined,
      marketCapRank: item.market_cap_rank || 0,
      dominance: undefined,
      source: 'coingecko',
      timestamp: new Date(),
      spread: undefined,
      symbol: item.symbol || cleanId,
      name: item.name || cleanId,
    };
  }

  // ============================================================
  // 3. YOUR EXISTING fetchTopCryptoMovers() – USED AS-IS
  // ============================================================
  async getTopMovers(limit: number = 5) {
    return fetchTopCryptoMovers(limit);
  }

  // ============================================================
  // 4. HISTORICAL OHLC – ✅ NO API KEY HEADER
  // ============================================================
  async getHistoricalData(assetId: string, days: number = 365): Promise<OHLCV[]> {
    const cleanId = assetId.replace(/^CRYPTO:/, '');
    const url = `${this.config.baseUrl}/coins/${cleanId}/ohlc?vs_currency=usd&days=${days}`;

    const response = await fetch(url, {
      // ✅ NO HEADERS
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new DataCollectionError(
        `Failed to fetch OHLC: ${response.status}`,
        'coingecko',
        { assetId: cleanId, status: response.status }
      );
    }

    const data = await response.json();
    return data.map((candle: [number, number, number, number, number]) => ({
      timestamp: new Date(candle[0]),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: 0,
    }));
  }

  // ============================================================
  // 5. HISTORICAL VOLUME – ✅ NO API KEY HEADER
  // ============================================================
  private async getHistoricalVolume(assetId: string, days: number = 365): Promise<{ timestamp: Date; volume: number }[]> {
    const cleanId = assetId.replace(/^CRYPTO:/, '');
    const url = `${this.config.baseUrl}/coins/${cleanId}/market_chart?vs_currency=usd&days=${days}`;

    const response = await fetch(url, {
      // ✅ NO HEADERS
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new DataCollectionError(
        `Failed to fetch volume data: ${response.status}`,
        'coingecko',
        { assetId: cleanId, status: response.status }
      );
    }

    const data = await response.json();
    return (data.total_volumes || []).map((item: [number, number]) => ({
      timestamp: new Date(item[0]),
      volume: item[1],
    }));
  }

  // ============================================================
  // 6. FULL HISTORICAL OHLCV (OHLC + Volume merged)
  // ============================================================
  async getFullHistoricalData(assetId: string, days: number = 365): Promise<OHLCV[]> {
    const [ohlc, volumes] = await Promise.all([
      this.getHistoricalData(assetId, days),
      this.getHistoricalVolume(assetId, days),
    ]);

    const volumeMap = new Map<string, number>();
    for (const v of volumes) {
      const key = v.timestamp.toISOString().split('T')[0];
      volumeMap.set(key, (volumeMap.get(key) || 0) + v.volume);
    }

    return ohlc.map((candle) => {
      const key = candle.timestamp.toISOString().split('T')[0];
      return {
        ...candle,
        volume: volumeMap.get(key) || 0,
      };
    });
  }

  // ============================================================
  // 7. ASSET METADATA – ✅ NO API KEY HEADER
  // ============================================================
  async getAssetMetadata(assetId: string): Promise<any> {
    const cleanId = assetId.replace(/^CRYPTO:/, '');
    const url = `${this.config.baseUrl}/coins/${cleanId}?localization=false&community_data=true&developer_data=true`;

    const response = await fetch(url, {
      // ✅ NO HEADERS
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new DataCollectionError(
        `Failed to fetch asset metadata: ${response.status}`,
        'coingecko',
        { assetId: cleanId, status: response.status }
      );
    }

    const data = await response.json();

    return {
      description: data.description?.en || '',
      categories: data.categories || [],
      blockchain: data.blockchain || 'unknown',
      consensusMechanism: data.consensus_mechanism || 'unknown',
      contractAddress: data.contract_address || undefined,
      developerActivity: {
        commits30d: data.developer_data?.commit_count_4_weeks || 0,
        activeDevs30d: data.developer_data?.developer_count || 0,
        trend: 'stable',
        stars: data.developer_data?.stars || 0,
        forks: data.developer_data?.forks || 0,
      },
      ecosystem: {
        activeAddresses30d: undefined,
        transactions30d: undefined,
        tvl: undefined,
      },
      competitors: data.competitors || [],
    };
  }

  // ============================================================
  // 8. GENERIC FETCH (not used)
  // ============================================================
  protected async fetchData(endpoint: string, params?: Record<string, any>): Promise<any> {
    throw new Error('Use specific methods instead (getQuotes, getFullMarketData, etc.)');
  }
}