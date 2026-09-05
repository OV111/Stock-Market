// Sharpe, Max drawdown, Beta, Correlation, Liquidity risk
import { DataPackage } from '../../types/data-package';
import { ModuleResult, Evidence } from '../../types/scores';
import { stdDev, mean, correlation } from '../../utils/math';

export class RiskScorer {
  score(data: DataPackage): ModuleResult {
    const evidence: Evidence[] = [];
    const market = data.market;
    const historical = data.historicalOhlcv;

    // 1. Volatility Risk (30d)
    let volatilityScore = 50;
    const vol = market.volatility30d;
    if (vol < 30) volatilityScore = 90;
    else if (vol < 50) volatilityScore = 70;
    else if (vol < 80) volatilityScore = 40;
    else volatilityScore = 20;

    evidence.push({
      type: volatilityScore > 60 ? 'bullish' : 'bearish',
      category: 'risk',
      metric: 'volatility_30d',
      value: vol,
      weight: 0.20,
      source: 'coingecko',
      confidence: 0.95,
      description: `30d volatility: ${vol.toFixed(1)}%`,
      timestamp: data.collectedAt,
    });

    // 2. Max Drawdown (historical)
    let drawdownScore = 50;
    if (historical && historical.length > 30) {
      const closes = historical.map((c) => c.close);
      let maxDrawdown = 0;
      let peak = closes[0];
      for (const price of closes) {
        if (price > peak) peak = price;
        const drawdown = (peak - price) / peak;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }
      // Lower drawdown = better risk score
      drawdownScore = 100 - Math.min(maxDrawdown * 100, 90);
      evidence.push({
        type: maxDrawdown < 0.4 ? 'bullish' : 'bearish',
        category: 'risk',
        metric: 'max_drawdown',
        value: maxDrawdown,
        weight: 0.20,
        source: 'historical',
        confidence: 0.90,
        description: `Historical max drawdown: ${(maxDrawdown * 100).toFixed(1)}%`,
        timestamp: data.collectedAt,
      });
    }

    // 3. Liquidity Risk (slippage estimate)
    const dailyVolume = market.volume24h;
    const orderSize = dailyVolume * 0.01; // 1% of daily volume
    const slippage = orderSize / dailyVolume * 0.01; // rough estimate
    let liquidityScore = 80;
    if (slippage > 0.05) liquidityScore = 20;
    else if (slippage > 0.02) liquidityScore = 50;
    evidence.push({
      type: liquidityScore > 60 ? 'bullish' : 'bearish',
      category: 'risk',
      metric: 'liquidity_risk',
      value: slippage,
      weight: 0.20,
      source: 'coingecko',
      confidence: 0.85,
      description: `Estimated slippage for 1% order: ${(slippage * 100).toFixed(2)}%`,
      timestamp: data.collectedAt,
    });

    // 4. Beta vs BTC (if historical data available)
    let betaScore = 50;
    if (historical && historical.length > 30 && data.macro.correlationToBtc) {
      const beta = data.macro.correlationToBtc;
      // Beta > 1 = amplified risk, Beta < 0.5 = dampened
      if (beta < 0.8) betaScore = 80;
      else if (beta < 1.2) betaScore = 60;
      else betaScore = 30;
      evidence.push({
        type: beta < 1 ? 'bullish' : 'bearish',
        category: 'risk',
        metric: 'beta_to_btc',
        value: beta,
        weight: 0.20,
        source: 'coingecko',
        confidence: 0.80,
        description: `Beta vs BTC: ${beta.toFixed(2)}`,
        timestamp: data.collectedAt,
      });
    }

    // 5. Sharpe Ratio (risk-adjusted return)
    let sharpeScore = 50;
    if (historical && historical.length > 90) {
      const closes = historical.map((c) => c.close);
      const returns: number[] = [];
      for (let i = 1; i < closes.length; i++) {
        returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
      }
      const avgReturn = mean(returns);
      const std = stdDev(returns);
      const sharpe = std > 0 ? (avgReturn * 252) / (std * Math.sqrt(252)) : 0;
      if (sharpe > 2) sharpeScore = 90;
      else if (sharpe > 1) sharpeScore = 70;
      else if (sharpe > 0) sharpeScore = 50;
      else sharpeScore = 30;
      evidence.push({
        type: sharpe > 1 ? 'bullish' : 'bearish',
        category: 'risk',
        metric: 'sharpe_ratio',
        value: sharpe,
        weight: 0.20,
        source: 'historical',
        confidence: 0.75,
        description: `Sharpe Ratio: ${sharpe.toFixed(2)}`,
        timestamp: data.collectedAt,
      });
    }

    // Composite risk score (inverted: higher = safer)
    const score = Math.round(
      volatilityScore * 0.20 +
      drawdownScore * 0.20 +
      liquidityScore * 0.20 +
      betaScore * 0.20 +
      sharpeScore * 0.20
    );

    const confidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / (evidence.length || 1) * 100;

    return {
      score: Math.min(Math.max(score, 0), 100),
      confidence,
      evidence,
      narrative: `Risk score: ${score}/100 (higher = safer). Volatility: ${vol.toFixed(1)}%`,
    };
  }
}
