// config/data-sources.ts
export interface DataSourceConfig {
  name: string;
  baseUrl: string;
  apiKeyEnv: string; // Empty string if no key required (free)
  rateLimitPerMinute: number;
  priority: number;
  timeoutMs: number;
  isEnabled: boolean;
}

export const dataSources: Record<string, DataSourceConfig> = {
  // ---- FREE MARKET DATA ----
  coingecko: {
    name: 'coingecko',
    baseUrl: 'https://api.coingecko.com/api/v3',
    apiKeyEnv: '', // Free tier does NOT require API key (just rate limited)
    rateLimitPerMinute: 30,
    priority: 1,
    timeoutMs: 10000,
    isEnabled: true,
  },
  coincap: {
    name: 'coincap',
    baseUrl: 'https://api.coincap.io/v2',
    apiKeyEnv: '',
    rateLimitPerMinute: 100,
    priority: 2,
    timeoutMs: 10000,
    isEnabled: true,
  },

  // ---- FREE ON-CHAIN (EVM only) ----
  etherscan: {
    name: 'etherscan',
    baseUrl: 'https://api.etherscan.io/api',
    apiKeyEnv: 'ETHERSCAN_API_KEY', // Free tier available
    rateLimitPerMinute: 5, // Slower free tier
    priority: 1,
    timeoutMs: 15000,
    isEnabled: true,
  },
  // Glassnode is PAID, so disabled by default unless key is provided
  glassnode: {
    name: 'glassnode',
    baseUrl: 'https://api.glassnode.com/v1',
    apiKeyEnv: 'GLASSNODE_API_KEY',
    rateLimitPerMinute: 30,
    priority: 2,
    timeoutMs: 15000,
    isEnabled: false, // DISABLED by default
  },

  // ---- FREE NEWS ----
  cryptopanic: {
    name: 'cryptopanic',
    baseUrl: 'https://cryptopanic.com/api/v1',
    apiKeyEnv: '', // Free tier works without API key (with limits)
    rateLimitPerMinute: 20,
    priority: 1,
    timeoutMs: 8000,
    isEnabled: true,
  },

  // ---- FREE MACRO ----
  yahooFinance: {
    name: 'yahoo_finance',
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance',
    apiKeyEnv: '',
    rateLimitPerMinute: 10,
    priority: 1,
    timeoutMs: 10000,
    isEnabled: true,
  },

  // ---- FREE DEVELOPER ----
  github: {
    name: 'github',
    baseUrl: 'https://api.github.com',
    apiKeyEnv: 'GITHUB_API_KEY', // Free tier with rate limits
    rateLimitPerMinute: 60,
    priority: 1,
    timeoutMs: 10000,
    isEnabled: true,
  },
};

export const sourcePriority = {
  marketData: ['coingecko', 'coincap'],
  historicalData: ['coingecko', 'coincap'],
  onchainData: ['etherscan', 'glassnode'], // Glassnode only works if key exists
  newsData: ['cryptopanic'],
  macroData: ['yahooFinance'],
};

// Helper to check if a source is usable
export function isSourceUsable(sourceName: string): boolean {
  const config = dataSources[sourceName];
  if (!config || !config.isEnabled) return false;
  // If it requires a key, check if the key is present in env
  if (config.apiKeyEnv && !process.env[config.apiKeyEnv]) return false;
  return true;
}

export function getApiKey(sourceName: string): string | undefined {
  const config = dataSources[sourceName];
  if (!config || !config.apiKeyEnv) return undefined;
  return process.env[config.apiKeyEnv] || undefined;
}