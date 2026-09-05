import { BaseCollector } from '../base-collector';
import { DataSourceConfig } from '../../config/data-sources';
import { dataSources } from '../../config';
import { OnChainData } from '../../types';

export class EtherscanCollector extends BaseCollector {
  protected loadConfig(): DataSourceConfig {
    return dataSources.etherscan;
  }

  protected async fetchData(endpoint: string, params?: Record<string, any>): Promise<any> {
    // Etherscan uses a query param style
    return this.get('', { module: 'stats', action: endpoint, ...params });
  }

  /**
   * Get on-chain metrics for an EVM token (requires contract address)
   */
  async getOnChainData(contractAddress: string): Promise<Partial<OnChainData>> {
    // Etherscan free tier limits: 5 calls/min
    // We'll aggregate available data

    const [supplyData, tokenStats] = await Promise.all([
      this.getTokenSupply(contractAddress),
      this.getTokenStats(contractAddress),
    ]);

    return {
      activeAddresses: {
        current: tokenStats?.holders || 0,
        change7d: 0, // Not available via Etherscan free API
        change30d: 0,
      },
      transactionCount: {
        daily: tokenStats?.transfers_24h || 0,
        change30d: 0,
      },
      transactionVolume: {
        dailyUsd: tokenStats?.volume_24h_usd || 0,
        change30d: 0,
      },
      exchangeFlows: {
        inflow24h: 0,
        outflow24h: 0,
        netFlow: 0,
        exchangeNetflowChange30d: 0,
      },
      whaleActivity: {
        largeTx24h: 0,
        whaleAccumulation: false,
        whaleDistribution: false,
      },
      supplyConcentration: {
        top10: 0,
        top100: 0,
      },
      networkHealth: 0.8, // Default moderate
      dataCompleteness: 0.5,
    };
  }

  private async getTokenSupply(contractAddress: string): Promise<any> {
    return this.fetchData('tokenSupply', { contractaddress: contractAddress });
  }

  private async getTokenStats(contractAddress: string): Promise<any> {
    return this.fetchData('tokenStats', { contractaddress: contractAddress });
  }

  /**
   * Check if Etherscan is usable (requires API key)
   */
  isUsable(): boolean {
    return super.isUsable() && !!process.env[this.config.apiKeyEnv];
  }
}