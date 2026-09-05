export interface MarketData {
  priceUsd: number;
  marketCap: number;
  fullyDilutedValuation?: number;
  volume24h: number;
  volumeToMarketCapRatio: number; // calculated
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  priceChange1h: number;
  priceChange24h: number;
  priceChange7d: number;
  priceChange30d: number;
  priceChange90d: number;
  priceChange1y?: number;
  volatility30d: number;
  volatility90d: number;
  ath: number;
  athDate?: Date;
  atl: number;
  atlDate?: Date;
  marketCapRank: number;
  dominance?: number; // only for top assets
  spread?: number; // bid-ask spread %
  source: string; // which API provided it
  timestamp: Date;
}

export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
