import { BaseCollector } from '../base-collector';
import { DataSourceConfig } from '../../config/data-sources';
import { dataSources } from '../../config';
import { MacroContext, TrendDirection } from '../../types';

export class YahooFinanceCollector extends BaseCollector {
  protected loadConfig(): DataSourceConfig {
    return dataSources.yahooFinance;
  }

  protected async fetchData(endpoint: string, params?: Record<string, any>): Promise<any> {
    return this.get(endpoint, params);
  }

  /**
   * Get macro market data (S&P500, VIX, Dollar Index, etc.)
   */
  async getMacroData(): Promise<Partial<MacroContext>> {
    const symbols = ['^GSPC', '^VIX', 'DX-Y.NYB', '^TNX'];
    const results = await Promise.all(
      symbols.map((symbol) => this.getQuote(symbol))
    );

    const sp500 = results[0];
    const vix = results[1];
    const dollar = results[2];
    const tenYear = results[3];

    return {
      sp500Trend: sp500 ? this.determineTrend(sp500.regularMarketPrice, sp500.regularMarketDayHigh) : undefined,
      vix: vix?.regularMarketPrice || 16.5,
      dollarIndex: dollar?.regularMarketPrice || 105,
      tenYearYield: tenYear?.regularMarketPrice || 4.2,
      // Other fields will be filled from CoinGecko/other sources in the aggregator
    };
  }

  private async getQuote(symbol: string): Promise<any> {
    try {
      const data = await this.fetchData(`/finance/v8/finance/chart/${symbol}`, {
        interval: '1d',
        range: '1d',
      });
      return data.chart?.result?.[0]?.meta || null;
    } catch (error) {
      this.logger.warn({ symbol, error: error.message }, 'Failed to fetch macro data');
      return null;
    }
  }

  private determineTrend(current: number, high: number): TrendDirection {
    if (!current || !high) return 'sideways';
    const ratio = current / high;
    if (ratio > 0.98) return 'uptrend';
    if (ratio < 0.92) return 'downtrend';
    return 'sideways';
  }
}