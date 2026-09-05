// SMA, EMA, RSI, MACD, Bollinger, ATR, Support/Resistance, Volatility
import {
  mean,
  stdDev,
  sma,
  ema,
  rsi,
  correlation,
} from '../utils/math';
import { OHLCV, TechnicalIndicators, MACD, BollingerBands, TrendDirection } from '../types';

export interface MetricCalculatorInput {
  ohlcv: OHLCV[]; // At least 200 candles for reliable indicators
}

export class MetricCalculator {
  /**
   * Calculate all technical indicators from OHLCV data
   */
  calculateIndicators(input: MetricCalculatorInput): TechnicalIndicators {
    const { ohlcv } = input;
    const closes = ohlcv.map((c) => c.close);
    const highs = ohlcv.map((c) => c.high);
    const lows = ohlcv.map((c) => c.low);
    const volumes = ohlcv.map((c) => c.volume);

    // --- Moving Averages ---
    const ema9 = this.last(ema(closes, 9));
    const ema20 = this.last(ema(closes, 20));
    const ema50 = this.last(ema(closes, 50));
    const ema200 = this.last(ema(closes, 200));
    const sma50 = this.last(sma(closes, 50));
    const sma200 = this.last(sma(closes, 200));

    // --- RSI ---
    const rsi14 = rsi(closes, 14);

    // --- MACD ---
    const macd = this.calculateMACD(closes);

    // --- Bollinger Bands ---
    const bb = this.calculateBollingerBands(closes, 20, 2);

    // --- ATR ---
    const atr14 = this.calculateATR(ohlcv, 14);

    // --- OBV (On-Balance Volume) ---
    const obv = this.calculateOBV(closes, volumes);

    // --- Support & Resistance ---
    const { supports, resistances } = this.findSupportResistance(ohlcv, 50);

    // --- Trend ---
    const trend = this.determineTrend(closes, ema20, ema50, ema200);
    const trendStrength = this.calculateTrendStrength(closes, ema50, ema200);

    // --- Overbought/Oversold ---
    const isOverbought = rsi14 > 70;
    const isOversold = rsi14 < 30;

    // --- Cross signals ---
    const goldenCross = ema50 > ema200 && this.previous(ema(closes, 50)) <= this.previous(ema(closes, 200));
    const deathCross = ema50 < ema200 && this.previous(ema(closes, 50)) >= this.previous(ema(closes, 200));

    // --- Volume trend ---
    const volumeTrend = this.calculateVolumeTrend(volumes);

    return {
      rsi14,
      macd,
      ema9: ema9 ?? 0,
      ema20: ema20 ?? 0,
      ema50: ema50 ?? 0,
      ema200: ema200 ?? 0,
      sma50: sma50 ?? 0,
      sma200: sma200 ?? 0,
      bollingerBands: bb,
      atr14,
      obv,
      supportLevels: supports,
      resistanceLevels: resistances,
      trend,
      trendStrength,
      isOverbought,
      isOversold,
      goldenCross,
      deathCross,
      volumeTrend,
    };
  }

  // --- Private helpers ---

  private last<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
  }

  private previous<T>(arr: T[]): T | undefined {
    return arr.length > 1 ? arr[arr.length - 2] : undefined;
  }

  private calculateMACD(closes: number[]): MACD {
    const ema12 = ema(closes, 12);
    const ema26 = ema(closes, 26);
    const macdLine: number[] = [];
    const minLen = Math.min(ema12.length, ema26.length);
    for (let i = 0; i < minLen; i++) {
      macdLine.push(ema12[i] - ema26[i]);
    }
    const signalLine = ema(macdLine, 9);
    const histogram = macdLine.map((v, i) => v - (signalLine[i] || 0));

    const lastIdx = macdLine.length - 1;
    return {
      value: macdLine[lastIdx] || 0,
      signal: signalLine[lastIdx] || 0,
      histogram: histogram[lastIdx] || 0,
    };
  }

  private calculateBollingerBands(closes: number[], period: number, multiplier: number): BollingerBands {
    const middle = sma(closes, period);
    const lastMiddle = middle.length > 0 ? middle[middle.length - 1] : closes[closes.length - 1] || 0;
    const recent = closes.slice(-period);
    const std = stdDev(recent);
    return {
      upper: lastMiddle + multiplier * std,
      middle: lastMiddle,
      lower: lastMiddle - multiplier * std,
      width: lastMiddle !== 0 ? (2 * multiplier * std) / lastMiddle : 0,
    };
  }

  private calculateATR(ohlcv: OHLCV[], period: number): number {
    if (ohlcv.length < period + 1) return 0;
    const trueRanges: number[] = [];
    for (let i = 1; i < ohlcv.length; i++) {
      const high = ohlcv[i].high;
      const low = ohlcv[i].low;
      const prevClose = ohlcv[i - 1].close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trueRanges.push(tr);
    }
    // SMA of true ranges
    const atrValues = sma(trueRanges, period);
    return atrValues.length > 0 ? atrValues[atrValues.length - 1] : 0;
  }

  private calculateOBV(closes: number[], volumes: number[]): number {
    let obv = 0;
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) obv += volumes[i];
      else if (closes[i] < closes[i - 1]) obv -= volumes[i];
    }
    return obv;
  }

  private findSupportResistance(ohlcv: OHLCV[], window: number): { supports: number[]; resistances: number[] } {
    const highs = ohlcv.map((c) => c.high);
    const lows = ohlcv.map((c) => c.low);

    const supports: number[] = [];
    const resistances: number[] = [];

    for (let i = window; i < ohlcv.length - window; i++) {
      const highWindow = highs.slice(i - window, i + window + 1);
      const lowWindow = lows.slice(i - window, i + window + 1);

      // Local maximum (resistance)
      if (highs[i] === Math.max(...highWindow)) {
        resistances.push(highs[i]);
      }
      // Local minimum (support)
      if (lows[i] === Math.min(...lowWindow)) {
        supports.push(lows[i]);
      }
    }

    // Cluster nearby levels (within 2%)
    const cluster = (levels: number[], threshold = 0.02): number[] => {
      if (levels.length === 0) return [];
      const sorted = [...levels].sort((a, b) => a - b);
      const clusters: number[][] = [];
      let current: number[] = [sorted[0]];
      for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i] - sorted[i - 1]) / sorted[i - 1];
        if (diff < threshold) {
          current.push(sorted[i]);
        } else {
          clusters.push(current);
          current = [sorted[i]];
        }
      }
      clusters.push(current);
      return clusters.map((c) => mean(c));
    };

    return {
      supports: cluster(supports).slice(-3).reverse(),
      resistances: cluster(resistances).slice(-3).reverse(),
    };
  }

  private determineTrend(closes: number[], ema20: number | undefined, ema50: number | undefined, ema200: number | undefined): TrendDirection {
    if (!ema20 || !ema50 || !ema200) return 'sideways';
    const lastClose = closes[closes.length - 1];
    if (lastClose > ema20 && ema20 > ema50 && ema50 > ema200) return 'uptrend';
    if (lastClose < ema20 && ema20 < ema50 && ema50 < ema200) return 'downtrend';
    return 'sideways';
  }

  private calculateTrendStrength(closes: number[], ema50: number | undefined, ema200: number | undefined): number {
    if (!ema50 || !ema200) return 0;
    const diff = (ema50 - ema200) / ema200;
    return Math.min(Math.abs(diff) * 10, 1); // Normalize: 10% diff = strength 1.0
  }

  private calculateVolumeTrend(volumes: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (volumes.length < 30) return 'stable';
    const recent = volumes.slice(-15);
    const older = volumes.slice(-30, -15);
    const avgRecent = mean(recent);
    const avgOlder = mean(older);
    const ratio = avgRecent / avgOlder;
    if (ratio > 1.2) return 'increasing';
    if (ratio < 0.8) return 'decreasing';
    return 'stable';
  }
}