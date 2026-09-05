export interface OnChainData {
  activeAddresses: {
    current: number;
    change7d: number;
    change30d: number;
  };
  transactionCount: {
    daily: number;
    change30d: number;
  };
  transactionVolume: {
    dailyUsd: number;
    change30d: number;
  };
  exchangeFlows: {
    inflow24h: number; // tokens
    outflow24h: number;
    netFlow: number; // positive = inflow, negative = outflow
    exchangeNetflowChange30d: number;
  };
  whaleActivity: {
    largeTx24h: number;
    whaleAccumulation: boolean;
    whaleDistribution: boolean;
  };
  supplyConcentration?: {
    top10: number;
    top100: number;
  };
  networkHealth: number; // 0-1
  averageGasFee?: number; // for EVM chains
  dexVolume24h?: number;
  stablecoinFlow?: {
    inflow24h: number;
    outflow24h: number;
  };
  dataCompleteness: number; // 0-1
}
