import { TrendDirection } from "./enums";

export interface MacroContext {
  btcTrend: TrendDirection;
  ethTrend: TrendDirection;
  totalMarketCap: number;
  btcDominance: number;
  ethDominance?: number;
  stablecoinMarketCap: number;
  fearAndGreedIndex: number; // 0-100
  riskEnvironment: "risk_on" | "risk_off" | "neutral";
  vix: number;
  sp500Trend?: TrendDirection;
  dollarIndex?: number;
  tenYearYield?: number;
  fedRateExpectations?: string;
  correlationToBtc: number; // -1 to 1
  correlationToEth: number;
}
