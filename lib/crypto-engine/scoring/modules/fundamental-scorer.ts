// Market cap score, Volume ratio, Drawdown vs ATH

import { DataPackage } from '../../types/data-package';
import { ModuleResult, Evidence } from '../../types/scores';

export class FundamentalScorer {
  score(data: DataPackage): ModuleResult {
    const evidence: Evidence[] = [];
    const market = data.market;
    const maxMarketCapInUniverse = 3_000_000_000_000; // ~3T as realistic cap

    // 1. Market Cap Relative Score (logarithmic)
    const marketCapScore = Math.log(market.marketCap) / Math.log(maxMarketCapInUniverse) * 100;
    evidence.push({
      type: 'neutral',
      category: 'fundamental',
      metric: 'market_cap_relative',
      value: marketCapScore,
      weight: 0.25,
      source: 'coingecko',
      confidence: 0.95,
      description: `Market cap ranks at ${marketCapScore.toFixed(0)}% of max universe`,
      timestamp: data.collectedAt,
    });

    // 2. Volume / Market Cap Ratio (Liquidity)
    const volRatio = market.volume24h / market.marketCap;
    let volumeScore = 50;
    if (volRatio >= 0.05 && volRatio <= 0.30) volumeScore = 90;
    else if (volRatio > 0.30) volumeScore = 70; // suspicious pump
    else if (volRatio > 0.01) volumeScore = 40;
    else volumeScore = 20; // illiquid
    evidence.push({
      type: volRatio >= 0.05 && volRatio <= 0.30 ? 'bullish' : 'bearish',
      category: 'fundamental',
      metric: 'volume_liquidity',
      value: volRatio,
      weight: 0.20,
      source: 'coingecko',
      confidence: 0.90,
      description: `24h volume / MC = ${(volRatio * 100).toFixed(2)}%`,
      timestamp: data.collectedAt,
    });

    // 3. Drawdown from ATH
    const drawdown = market.ath > 0 ? (market.ath - market.priceUsd) / market.ath : 0;
    let drawdownScore = 50 + drawdown * 50; // 0% drawdown = 50, 100% drawdown = 100
    drawdownScore = Math.min(Math.max(drawdownScore, 0), 100);
    evidence.push({
      type: drawdown > 0.3 ? 'bullish' : 'neutral',
      category: 'fundamental',
      metric: 'ath_drawdown',
      value: drawdown,
      weight: 0.15,
      source: 'coingecko',
      confidence: 0.95,
      description: `${(drawdown * 100).toFixed(1)}% below ATH`,
      timestamp: data.collectedAt,
    });

    // 4. Price change momentum
    const momentumScore = 50 + (market.priceChange30d / 10); // +10% = +1 point
    const clampedMomentum = Math.min(Math.max(momentumScore, 0), 100);
    evidence.push({
      type: market.priceChange30d > 0 ? 'bullish' : 'bearish',
      category: 'fundamental',
      metric: 'momentum_30d',
      value: market.priceChange30d,
      weight: 0.15,
      source: 'coingecko',
      confidence: 0.90,
      description: `30d change: ${market.priceChange30d > 0 ? '+' : ''}${market.priceChange30d.toFixed(2)}%`,
      timestamp: data.collectedAt,
    });

    // Composite fundamental score (weighted)
    const score = Math.round(
      marketCapScore * 0.25 +
      volumeScore * 0.20 +
      drawdownScore * 0.15 +
      clampedMomentum * 0.15 +
      50 * 0.25 // baseline
    );

    const confidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length * 100;

    return {
      score: Math.min(Math.max(score, 0), 100),
      confidence,
      evidence,
      narrative: `Fundamental strength: ${score}/100. ${drawdown > 0.3 ? 'Significant discount from ATH.' : 'Near ATH.'}`,
    };
  }
}