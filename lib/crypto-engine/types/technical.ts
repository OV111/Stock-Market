import { TrendDirection } from "./enums";

export interface MACD {
  value: number;
  signal: number;
  histogram: number;
}

export interface BollingerBands {
  upper: number;
  middle: number;
  lower: number;
  width: number; // (upper-lower)/middle
}

export interface TechnicalIndicators {
  rsi14: number;
  macd: MACD;
  ema9: number;
  ema20: number;
  ema50: number;
  ema200: number;
  sma50: number;
  sma200: number;
  bollingerBands: BollingerBands;
  atr14: number;
  obv: number; // On-Balance Volume
  supportLevels: number[];
  resistanceLevels: number[];
  trend: TrendDirection;
  trendStrength: number; // 0-1
  // Additional derived metrics
  isOverbought: boolean;
  isOversold: boolean;
  goldenCross: boolean; // 50-day above 200-day
  deathCross: boolean;
  volumeTrend: "increasing" | "decreasing" | "stable";
}

export interface SupportResistance {
  supports: number[];
  resistances: number[];
  pivot: number;
}
