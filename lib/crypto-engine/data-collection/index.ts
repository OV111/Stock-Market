export { BaseCollector } from './base-collector';
export { DataAggregator } from './data-aggregator';
export { CoinGeckoCollector } from './sources/coingecko-collector';
export { EtherscanCollector } from './sources/etherscan-collector';
export { CryptoPanicCollector } from './sources/cryptopanic-collector';
export { GitHubCollector } from './sources/github-collector';
export { YahooFinanceCollector } from './sources/yahoo-finance-collector';

// Default convenience export
import { DataAggregator } from './data-aggregator';
export default DataAggregator;