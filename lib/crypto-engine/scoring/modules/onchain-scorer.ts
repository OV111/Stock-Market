//  NVT, MVRV, Active address growth, Exchange flow
import { DataPackage } from '../../types/data-package';
import { ModuleResult, Evidence } from '../../types/scores';

export class OnchainScorer {
  score(data: DataPackage): ModuleResult {
    const evidence: Evidence[] = [];
    const onchain = data.onchain;

    if (!onchain) {
      return {
        score: 50,
        confidence: 0,
        evidence: [],
        narrative: 'No on-chain data available for this asset.',
      };
    }

    // 1. NVT Ratio (Network Value to Transactions)
    let nvtScore = 50;
    const nvt = data.market.marketCap / (onchain.transactionVolume.dailyUsd || 1);
    if (nvt > 0 && nvt < 100) nvtScore = 80;
    else if (nvt >= 100 && nvt < 300) nvtScore = 60;
    else if (nvt >= 300) nvtScore = 30;
    evidence.push({
      type: nvt < 100 ? 'bullish' : 'bearish',
      category: 'onchain',
      metric: 'nvt_ratio',
      value: nvt,
      weight: 0.20,
      source: 'glassnode',
      confidence: 0.85,
      description: `NVT: ${nvt.toFixed(1)} (lower = undervalued relative to usage)`,
      timestamp: data.collectedAt,
    });

    // 2. Active Address Growth
    const addressGrowth = onchain.activeAddresses.change30d;
    let addressScore = 50 + addressGrowth * 2; // +10% growth = +20 points
    addressScore = Math.min(Math.max(addressScore, 0), 100);
    evidence.push({
      type: addressGrowth > 0 ? 'bullish' : 'bearish',
      category: 'onchain',
      metric: 'active_address_growth',
      value: addressGrowth,
      weight: 0.20,
      source: 'glassnode',
      confidence: 0.90,
      description: `Active addresses 30d change: ${addressGrowth > 0 ? '+' : ''}${addressGrowth.toFixed(2)}%`,
      timestamp: data.collectedAt,
    });

    // 3. Exchange Flow (net outflow = accumulation = bullish)
    const netFlow = onchain.exchangeFlows.netFlow;
    let flowScore = 50;
    if (netFlow < 0) flowScore = 80; // net outflow = accumulation
    else if (netFlow > 0) flowScore = 30; // net inflow = selling
    evidence.push({
      type: netFlow < 0 ? 'bullish' : 'bearish',
      category: 'onchain',
      metric: 'exchange_flow',
      value: netFlow,
      weight: 0.25,
      source: 'glassnode',
      confidence: 0.85,
      description: `${Math.abs(netFlow).toFixed(0)} tokens ${netFlow < 0 ? 'leaving' : 'entering'} exchanges`,
      timestamp: data.collectedAt,
    });

    // 4. Whale Accumulation
    let whaleScore = 50;
    if (onchain.whaleActivity.whaleAccumulation) whaleScore = 80;
    if (onchain.whaleActivity.whaleDistribution) whaleScore = 30;
    evidence.push({
      type: onchain.whaleActivity.whaleAccumulation ? 'bullish' : 'neutral',
      category: 'onchain',
      metric: 'whale_activity',
      value: onchain.whaleActivity.whaleAccumulation ? 1 : 0,
      weight: 0.20,
      source: 'glassnode',
      confidence: 0.75,
      description: `Whale accumulation: ${onchain.whaleActivity.whaleAccumulation ? 'Yes' : 'No'}`,
      timestamp: data.collectedAt,
    });

    // 5. Network Health
    const healthScore = onchain.networkHealth * 100;
    evidence.push({
      type: onchain.networkHealth > 0.7 ? 'bullish' : 'neutral',
      category: 'onchain',
      metric: 'network_health',
      value: onchain.networkHealth,
      weight: 0.15,
      source: 'glassnode',
      confidence: 0.80,
      description: `Network health: ${(onchain.networkHealth * 100).toFixed(0)}%`,
      timestamp: data.collectedAt,
    });

    const score = Math.round(
      nvtScore * 0.20 +
      addressScore * 0.20 +
      flowScore * 0.25 +
      whaleScore * 0.20 +
      healthScore * 0.15
    );

    const confidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length * 100;

    return {
      score: Math.min(Math.max(score, 0), 100),
      confidence,
      evidence,
      narrative: `On-chain health: ${score}/100. ${netFlow < 0 ? 'Accumulation detected.' : 'Net selling pressure.'}`,
    };
  }
}