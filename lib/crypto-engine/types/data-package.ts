// data-package.ts
import { Asset } from "./asset";
import { MarketData, OHLCV } from "./market-data";
import { TechnicalIndicators } from "./technical";
import { FundamentalData } from "./fundamental";
import { TokenomicsData } from "./tokenomics";
import { OnChainData } from "./onchain";
import { NewsItem } from "./news";
import { MacroContext } from "./macro";

export interface DataQualityMetadata {
  completeness: number; // 0-1
  freshness: number; // 0-1
  reliability: number; // 0-1
  overallQuality: number; // 0-1
  missingFields: string[];
  staleFields: string[];
}

export interface DataPackage {
  asset: Asset;
  market: MarketData;
  historicalOhlcv: OHLCV[]; // at least 1 year
  technical: TechnicalIndicators;
  fundamental: FundamentalData;
  tokenomics: TokenomicsData;
  onchain: OnChainData | null;
  news: NewsItem[];
  macro: MacroContext;
  collectedAt: Date;
  dataQuality: DataQualityMetadata;
}
