// Inflation, S2F, Unlock pressure, Gini coefficient
import { DataPackage } from '../../types/data-package';
import { ModuleResult, Evidence } from '../../types/scores';

export class TokenomicsScorer {
  score(data: DataPackage): ModuleResult {
    const evidence: Evidence[] = [];
    const token = data.tokenomics;
    const market = data.market;

    // 1. Inflation / Emission Rate
    let inflationScore = 80;
    if (token.inflationRate > 20) inflationScore = 20;
    else if (token.inflationRate > 10) inflationScore = 40;
    else if (token.inflationRate > 5) inflationScore = 60;
    else if (token.inflationRate > 0) inflationScore = 80;
    else inflationScore = 95; // deflationary

    evidence.push({
      type: token.inflationRate < 5 ? 'bullish' : 'bearish',
      category: 'tokenomics',
      metric: 'inflation_rate',
      value: token.inflationRate,
      weight: 0.25,
      source: 'coingecko',
      confidence: 0.90,
      description: `Annual inflation: ${token.inflationRate.toFixed(2)}%`,
      timestamp: data.collectedAt,
    });

    // 2. Unlock Pressure (next 6 months)
    const unlockPercent = token.unlocksNext6m / market.circulatingSupply;
    let unlockScore = 80;
    if (unlockPercent > 0.10) unlockScore = 20;
    else if (unlockPercent > 0.05) unlockScore = 40;
    else if (unlockPercent > 0.01) unlockScore = 60;
    else unlockScore = 90;

    evidence.push({
      type: unlockPercent < 0.05 ? 'bullish' : 'bearish',
      category: 'tokenomics',
      metric: 'unlock_pressure',
      value: unlockPercent,
      weight: 0.25,
      source: 'project_docs',
      confidence: 0.85,
      description: `${(unlockPercent * 100).toFixed(2)}% of supply unlocking in 6m`,
      timestamp: data.collectedAt,
    });

    // 3. Gini Coefficient (concentration risk)
    let giniScore = 80;
    if (token.distribution.giniCoefficient !== undefined) {
      const gini = token.distribution.giniCoefficient;
      if (gini > 0.7) giniScore = 20;
      else if (gini > 0.5) giniScore = 50;
      else if (gini > 0.3) giniScore = 70;
      else giniScore = 90;
      evidence.push({
        type: gini < 0.5 ? 'bullish' : 'bearish',
        category: 'tokenomics',
        metric: 'gini_coefficient',
        value: gini,
        weight: 0.20,
        source: 'glassnode',
        confidence: 0.80,
        description: `Gini coefficient: ${gini.toFixed(3)}`,
        timestamp: data.collectedAt,
      });
    }

    // 4. Stock-to-Flow (for scarcity assets)
    let s2fScore = 50;
    if (market.maxSupply && token.inflationRate > 0) {
      const s2f = market.circulatingSupply / (token.inflationRate / 100 * market.circulatingSupply);
      if (s2f > 100) s2fScore = 90;
      else if (s2f > 50) s2fScore = 80;
      else if (s2f > 20) s2fScore = 60;
      else if (s2f > 5) s2fScore = 40;
      else s2fScore = 20;
      evidence.push({
        type: s2f > 50 ? 'bullish' : 'neutral',
        category: 'tokenomics',
        metric: 'stock_to_flow',
        value: s2f,
        weight: 0.15,
        source: 'coingecko',
        confidence: 0.85,
        description: `Stock-to-Flow: ${s2f.toFixed(1)}`,
        timestamp: data.collectedAt,
      });
    }

    // 5. Staking yield attractiveness
    let stakingScore = 50;
    if (token.stakingYield) {
      if (token.stakingYield > 15) stakingScore = 90;
      else if (token.stakingYield > 8) stakingScore = 70;
      else if (token.stakingYield > 3) stakingScore = 50;
      else stakingScore = 30;
      evidence.push({
        type: token.stakingYield > 5 ? 'bullish' : 'neutral',
        category: 'tokenomics',
        metric: 'staking_yield',
        value: token.stakingYield,
        weight: 0.15,
        source: 'project_docs',
        confidence: 0.80,
        description: `Staking yield: ${token.stakingYield.toFixed(2)}%`,
        timestamp: data.collectedAt,
      });
    }

    const score = Math.round(
      inflationScore * 0.25 +
      unlockScore * 0.25 +
      (giniScore || 50) * 0.20 +
      (s2fScore || 50) * 0.15 +
      (stakingScore || 50) * 0.15
    );

    const confidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / (evidence.length || 1) * 100;

    return {
      score: Math.min(Math.max(score, 0), 100),
      confidence,
      evidence,
      narrative: `Tokenomics health: ${score}/100. Inflation ${token.inflationRate.toFixed(2)}%, unlocks ${(unlockPercent * 100).toFixed(2)}%.`,
    };
  }
}