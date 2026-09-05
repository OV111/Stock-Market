import {
  DataPackage,
  Asset,
  MarketData,
  OHLCV,
  FundamentalData,
  TokenomicsData,
  OnChainData,
  NewsItem,
  MacroContext,
  DataQualityMetadata,
} from "../types";
import { CoinGeckoCollector } from "./sources/coingecko-collector";
import { EtherscanCollector } from "./sources/etherscan-collector";
import { CryptoPanicCollector } from "./sources/cryptopanic-collector";
import { GitHubCollector } from "./sources/github-collector";
import logger from "../utils/logger";

export class DataAggregator {
  private coingecko: CoinGeckoCollector;
  private etherscan: EtherscanCollector;
  private cryptopanic: CryptoPanicCollector;
  private github: GitHubCollector;

  constructor() {
    this.coingecko = new CoinGeckoCollector();
    this.etherscan = new EtherscanCollector();
    this.cryptopanic = new CryptoPanicCollector();
    this.github = new GitHubCollector();
  }

  /**
   * Collect ALL data for an asset and return a complete DataPackage
   */
  async collectAll(
    rawAssetId: string,
    options?: { days?: number },
  ): Promise<DataPackage> {
    const days = options?.days || 365;
    const startTime = Date.now();
    const assetId = rawAssetId.replace(/^CRYPTO:/, "");
    logger.info({ assetId }, "Starting data collection");

    // ---- Step 1: Get asset metadata from CoinGecko ----
    const assetMeta = await this.coingecko.getAssetMetadata(assetId);

    const asset: Asset = {
      id: assetId,
      symbol: "",
      name: "",
      blockchain: assetMeta.blockchain || "unknown",
      contractAddress: assetMeta.contractAddress,
      categories: assetMeta.categories || [],
      isStablecoin: false,
      isMemeCoin: false,
      isDeFi: assetMeta.categories?.includes("decentralized_finance") || false,
      isGaming: assetMeta.categories?.includes("gaming") || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: assetMeta.description,
    };

    // ---- Step 2: Collect market data ----
    logger.debug({ assetId }, "Fetching market data");

    // 2a. Get lightweight quote from your existing function
    const quoteData = await this.coingecko.getQuotes([assetId]);
    const lightMarket = quoteData[0];

    // 2b. Get FULL market data (market cap, volume, supply, etc.)
    let fullMarket: MarketData;
    try {
      fullMarket = await this.coingecko.getFullMarketData(assetId);
    } catch (error) {
      // If full market fails, use lightweight data as fallback
      if (lightMarket) {
        logger.warn(
          { assetId, error: (error as Error).message },
          "Full market data failed, using lightweight fallback",
        );
        fullMarket = {
          ...lightMarket,
          priceUsd: lightMarket.priceUsd || 0,
          priceChange24h: lightMarket.priceChange24h || 0,
          marketCap: 0,
          volume24h: 0,
          circulatingSupply: 0,
          totalSupply: 0,
          maxSupply: null,
          priceChange1h: 0,
          priceChange7d: 0,
          priceChange30d: 0,
          priceChange90d: 0,
          volatility30d: 0,
          volatility90d: 0,
          ath: 0,
          atl: 0,
          marketCapRank: 0,
          source: "coingecko",
          timestamp: new Date(),
          fullyDilutedValuation: undefined,
          volumeToMarketCapRatio: 0,
          priceChange1y: undefined,
          athDate: undefined,
          atlDate: undefined,
          dominance: undefined,
          spread: undefined,
        } as MarketData;
      } else {
        // No data at all – rethrow with context
        throw new Error(`No market data available for ${assetId}`);
      }
    }

    const marketData = fullMarket;

    // Update asset metadata from the response
    asset.symbol = (marketData as any).symbol || asset.symbol;
    asset.name = (marketData as any).name || asset.name;

    // ---- Step 3: Collect historical OHLCV ----
    logger.debug({ assetId }, "Fetching historical data");
    let historical: OHLCV[] = [];
    try {
      historical = await this.coingecko.getFullHistoricalData(assetId, days);
    } catch (error) {
      logger.warn(
        { assetId, error: (error as Error).message },
        "Failed to fetch historical data, using empty array",
      );
      // Continue with empty historical data – scoring will have lower confidence
    }

    // ---- Step 4: Collect on-chain data (if EVM and has contract address) ----
    let onchainData: OnChainData | null = null;
    if (asset.contractAddress && this.etherscan.isUsable()) {
      logger.debug(
        { assetId, contract: asset.contractAddress },
        "Fetching on-chain data",
      );
      try {
        const onchainPartial = await this.etherscan.getOnChainData(
          asset.contractAddress,
        );
        onchainData = {
          activeAddresses: { current: 0, change7d: 0, change30d: 0 },
          transactionCount: { daily: 0, change30d: 0 },
          transactionVolume: { dailyUsd: 0, change30d: 0 },
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
          networkHealth: 0.5,
          dataCompleteness: 0.3,
          ...onchainPartial,
        } as OnChainData;
      } catch (error) {
        logger.warn(
          { assetId, error: (error as Error).message },
          "Failed to fetch on-chain data",
        );
      }
    }

    // ---- Step 5: Collect news ----
    logger.debug({ assetId }, "Fetching news");
    let news: NewsItem[] = [];
    try {
      news = await this.cryptopanic.getNews(assetId);
    } catch (error) {
      logger.warn(
        { assetId, error: (error as Error).message },
        "Failed to fetch news",
      );
    }

    // ---- Step 6: Collect macro data (defaults only – no external API) ----
    logger.debug("Using default macro context");
    const macro: MacroContext = {
      btcTrend: "sideways",
      ethTrend: "sideways",
      totalMarketCap: 0,
      btcDominance: 0,
      stablecoinMarketCap: 0,
      fearAndGreedIndex: 50,
      riskEnvironment: "neutral",
      vix: 16.5,
      correlationToBtc: 0,
      correlationToEth: 0,
    };

    // ---- Step 7: Build Tokenomics data ----
    const tokenomics: TokenomicsData = {
      inflationRate: this.calculateInflationRate(marketData),
      emissionSchedule: [],
      vestingSchedule: [],
      stakingYield: undefined,
      stakingRatio: undefined,
      governanceParticipation: undefined,
      distribution: { top10Percent: undefined, top100Percent: undefined },
      unlocksNext6m: 0,
      unlocksNext12m: 0,
      totalUnlockedPercent:
        (marketData.circulatingSupply /
          (marketData.maxSupply || marketData.circulatingSupply)) *
        100,
      isDeflationary:
        marketData.maxSupply !== null &&
        marketData.maxSupply <= marketData.circulatingSupply,
      buybackBurn: false,
    };

    // ---- Step 8: Build FundamentalData ----
    const fundamental: FundamentalData = {
      useCase: assetMeta.description || "",
      blockchainArchitecture: assetMeta.blockchain || "unknown",
      consensusMechanism: assetMeta.consensusMechanism || "unknown",
      developerActivity: assetMeta.developerActivity || {
        commits30d: 0,
        activeDevs30d: 0,
        trend: "stable",
      },
      ecosystem: assetMeta.ecosystem || {
        activeAddresses30d: undefined,
        transactions30d: undefined,
        tvl: undefined,
      },
      competitors: assetMeta.competitors || [],
      adoptionIndicators: {},
    };

    // ---- Step 9: Build DataQuality Metadata ----
    const dataQuality: DataQualityMetadata = {
      completeness: this.calculateCompleteness({
        market: marketData,
        fundamental,
        tokenomics,
      }),
      freshness: 0.95,
      reliability: 0.9,
      overallQuality: 0.85,
      missingFields: this.findMissingFields({
        market: marketData,
        fundamental,
        tokenomics,
      }),
      staleFields: [],
    };

    // ---- Step 10: Assemble final DataPackage ----
    const dataPackage: DataPackage = {
      asset,
      market: marketData,
      historicalOhlcv: historical,
      technical: {} as any, // Will be calculated by MetricCalculator later
      fundamental,
      tokenomics,
      onchain: onchainData,
      news,
      macro,
      collectedAt: new Date(),
      dataQuality,
    };

    const elapsed = Date.now() - startTime;
    logger.info({ assetId, elapsedMs: elapsed }, "Data collection complete");

    return dataPackage;
  }

  // ---- Helpers ----

  private calculateInflationRate(market: MarketData): number {
    if (!market.maxSupply || market.maxSupply <= 0) return 0;
    const unlocked = market.circulatingSupply / market.maxSupply;
    if (unlocked >= 0.95) return 0.5;
    return Math.max(0, (1 - unlocked) * 8);
  }

  private calculateCompleteness(data: any): number {
    const required = [
      "market.priceUsd",
      "market.marketCap",
      "fundamental.useCase",
    ];
    let present = 0;
    for (const field of required) {
      const parts = field.split(".");
      let current = data;
      for (const part of parts) {
        if (current === undefined || current === null || !(part in current))
          break;
        current = current[part];
      }
      if (current !== undefined && current !== null) present++;
    }
    return present / required.length;
  }

  private findMissingFields(data: any): string[] {
    const fields = [
      "market.priceUsd",
      "market.marketCap",
      "fundamental.useCase",
      "tokenomics.inflationRate",
    ];
    const missing: string[] = [];
    for (const field of fields) {
      const parts = field.split(".");
      let current = data;
      for (const part of parts) {
        if (current === undefined || current === null || !(part in current)) {
          missing.push(field);
          break;
        }
        current = current[part];
      }
    }
    return missing;
  }
}
