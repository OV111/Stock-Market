// config/scoring-weights.ts
import { AssetCategory } from '../types/enums';

export interface WeightConfig {
  fundamental: number;
  technical: number;
  tokenomics: number;
  onchain: number;
  sentiment: number;
  risk: number;
  macro: number;
  valuation: number; // derived but included for clarity
}

// Base weights (sum to 100)
export const BASE_WEIGHTS: WeightConfig = {
  fundamental: 25,
  technical: 15,
  tokenomics: 20,
  onchain: 10,
  sentiment: 10,
  risk: 10,
  macro: 10,
  valuation: 0, // derived from fundamental+technical
};

// Adjustments based on asset category
export const CATEGORY_WEIGHT_ADJUSTMENTS: Record<AssetCategory, Partial<WeightConfig>> = {
  defi: {
    fundamental: 30, // TVL, usage matter more
    tokenomics: 25,
    onchain: 15,
    sentiment: 10,
    technical: 10,
    macro: 5,
    risk: 5,
  },
  layer1: {
    fundamental: 25,
    technical: 15,
    tokenomics: 20,
    onchain: 15, // chain activity matters
    sentiment: 10,
    macro: 10,
    risk: 5,
  },
  layer2: {
    fundamental: 25,
    technical: 15,
    tokenomics: 20,
    onchain: 15,
    sentiment: 10,
    macro: 10,
    risk: 5,
  },
  meme: {
    fundamental: 5, // fundamentals barely matter
    tokenomics: 15,
    technical: 20, // technicals matter more for memes
    onchain: 5,
    sentiment: 35, // sentiment is everything
    macro: 10,
    risk: 10,
  },
  gaming: {
    fundamental: 30,
    tokenomics: 20,
    technical: 10,
    onchain: 10,
    sentiment: 15,
    macro: 10,
    risk: 5,
  },
  infrastructure: {
    fundamental: 30,
    tokenomics: 20,
    technical: 10,
    onchain: 15,
    sentiment: 10,
    macro: 10,
    risk: 5,
  },
  stablecoin: {
    fundamental: 20,
    technical: 5,
    tokenomics: 10,
    onchain: 5,
    sentiment: 10,
    macro: 30, // macro heavily impacts stablecoins
    risk: 20,
  },
  other: {
    fundamental: 25,
    technical: 15,
    tokenomics: 20,
    onchain: 10,
    sentiment: 10,
    macro: 10,
    risk: 10,
  },
};

// Returns normalized weights for a given asset category
export function getWeightsForCategory(category: AssetCategory): WeightConfig {
  const base = { ...BASE_WEIGHTS };
  const adjustment = CATEGORY_WEIGHT_ADJUSTMENTS[category] || {};
  
  // Apply adjustments
  for (const key of Object.keys(base) as (keyof WeightConfig)[]) {
    if (adjustment[key] !== undefined) {
      base[key] = adjustment[key] as number;
    }
  }
  
  // Normalize to sum to 100
  const total = Object.values(base).reduce((a, b) => a + b, 0);
  if (total === 0) return base;
  
  const normalized: WeightConfig = {} as WeightConfig;
  for (const key of Object.keys(base) as (keyof WeightConfig)[]) {
    normalized[key] = Math.round((base[key] / total) * 100);
  }
  return normalized;
}

// Dynamic adjustment based on market phase
export function adjustWeightsForMarketPhase(
  weights: WeightConfig,
  phase: 'bull' | 'bear' | 'sideways'
): WeightConfig {
  const adjusted = { ...weights };
  
  if (phase === 'bull') {
    adjusted.technical += 5;
    adjusted.sentiment += 5;
    adjusted.fundamental -= 5;
    adjusted.macro -= 5;
  } else if (phase === 'bear') {
    adjusted.fundamental += 5;
    adjusted.risk += 5;
    adjusted.technical -= 5;
    adjusted.sentiment -= 5;
  }
  // sideways: no change
  
  // Re-normalize
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(adjusted) as (keyof WeightConfig)[]) {
    adjusted[key] = Math.round((adjusted[key] / total) * 100);
  }
  return adjusted;
}