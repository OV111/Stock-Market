// config/cache-ttl.ts
export interface CacheTTLConfig {
  // Micro-cache (price-sensitive)
  price: number; // seconds
  // Short cache (market data)
  marketData: number;
  technicalIndicators: number;
  // Medium cache
  onchainData: number;
  news: number;
  sentiment: number;
  // Long cache
  fundamentalData: number;
  tokenomics: number;
  macroData: number;
  // Analysis results
  fullAnalysis: number;
  // Permanent
  assetMetadata: number; // -1 = never expires
}

export const CACHE_TTL: CacheTTLConfig = {
  price: 60, // 1 minute
  marketData: 300, // 5 minutes
  technicalIndicators: 900, // 15 minutes
  onchainData: 1800, // 30 minutes
  news: 600, // 10 minutes
  sentiment: 1800, // 30 minutes
  fundamentalData: 43200, // 12 hours
  tokenomics: 86400, // 24 hours
  macroData: 3600, // 1 hour
  fullAnalysis: 2700, // 45 minutes
  assetMetadata: -1, // never
};

// Key prefix for Redis
export const CACHE_PREFIX = 'crypto_engine:';

// Cache key generator
export function getCacheKey(prefix: string, ...parts: string[]): string {
  return `${CACHE_PREFIX}${prefix}:${parts.join(':')}`;
}