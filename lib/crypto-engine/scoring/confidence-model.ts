// Confidence = f(completeness, freshness, agreement, consistency)
import { DataPackage } from '../types/data-package';
import { ModuleResult } from '../types/scores';

export interface ConfidenceResult {
  confidence: number; // 0-100
  components: {
    completeness: number;
    freshness: number;
    agreement: number;
    consistency: number;
  };
  penalties: {
    missingData: number;
    staleData: number;
    contradictions: number;
  };
}

export class ConfidenceModel {
  calculate(
    data: DataPackage,
    moduleScores: Record<string, ModuleResult>,
    modelAgreement?: number // 0-1, only if multiple AI models ran
  ): ConfidenceResult {
    // 1. Data Completeness (35%)
    const completeness = this.calculateCompleteness(data);

    // 2. Data Freshness (25%)
    const freshness = this.calculateFreshness(data);

    // 3. Model Agreement (25%) – only if available
    let agreement = 0.5; // default neutral
    if (modelAgreement !== undefined) {
      agreement = modelAgreement;
    }

    // 4. Indicator Consistency (15%)
    const consistency = this.calculateIndicatorConsistency(moduleScores);

    // Base confidence
    let confidence =
      completeness * 0.35 +
      freshness * 0.25 +
      agreement * 0.25 +
      consistency * 0.15;

    // Penalties
    const penalties = {
      missingData: this.calculateMissingPenalty(data),
      staleData: this.calculateStalePenalty(data),
      contradictions: this.calculateContradictionPenalty(moduleScores),
    };

    // Apply penalties (each reduces confidence by 0-15%)
    confidence = confidence * (1 - penalties.missingData);
    confidence = confidence * (1 - penalties.staleData);
    confidence = confidence * (1 - penalties.contradictions);

    // Clamp and convert to 0-100
    const finalConfidence = Math.min(Math.max(Math.round(confidence * 100), 0), 100);

    return {
      confidence: finalConfidence,
      components: {
        completeness: Math.round(completeness * 100),
        freshness: Math.round(freshness * 100),
        agreement: Math.round(agreement * 100),
        consistency: Math.round(consistency * 100),
      },
      penalties: {
        missingData: Math.round(penalties.missingData * 100),
        staleData: Math.round(penalties.staleData * 100),
        contradictions: Math.round(penalties.contradictions * 100),
      },
    };
  }

  private calculateCompleteness(data: DataPackage): number {
    const requiredFields = [
      'asset',
      'market.priceUsd',
      'market.marketCap',
      'market.volume24h',
      'market.circulatingSupply',
      'technical',
      'fundamental',
      'tokenomics',
    ];
    let present = 0;
    for (const field of requiredFields) {
      const parts = field.split('.');
      let current: any = data;
      for (const part of parts) {
        if (current === undefined || current === null || !(part in current)) {
          break;
        }
        current = current[part];
      }
      if (current !== undefined && current !== null) present++;
    }
    return present / requiredFields.length;
  }

  private calculateFreshness(data: DataPackage): number {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    const age = now - new Date(data.collectedAt).getTime();
    return Math.max(0, 1 - age / maxAge);
  }

  private calculateIndicatorConsistency(moduleScores: Record<string, ModuleResult>): number {
    // Count bullish vs bearish evidence
    let bullish = 0,
      bearish = 0;
    for (const [_, result] of Object.entries(moduleScores)) {
      for (const ev of result.evidence || []) {
        if (ev.type === 'bullish') bullish++;
        else if (ev.type === 'bearish') bearish++;
      }
    }
    const total = bullish + bearish;
    if (total === 0) return 0.5;
    const ratio = Math.min(bullish, bearish) / Math.max(bullish, bearish);
    return 1 - ratio * 0.5; // 0.5 = perfect balance, 1 = all agree
  }

  private calculateMissingPenalty(data: DataPackage): number {
    const required = ['market.priceUsd', 'market.marketCap', 'fundamental.useCase'];
    let missing = 0;
    for (const field of required) {
      const parts = field.split('.');
      let current: any = data;
      for (const part of parts) {
        if (current === undefined || current === null || !(part in current)) {
          missing++;
          break;
        }
        current = current[part];
      }
    }
    return Math.min(0.15, missing / required.length * 0.15);
  }

  private calculateStalePenalty(data: DataPackage): number {
    const now = Date.now();
    const age = now - new Date(data.collectedAt).getTime();
    if (age > 3600 * 1000) return 0.1; // >1 hour = 10% penalty
    if (age > 1800 * 1000) return 0.05; // >30 min = 5% penalty
    return 0;
  }

  private calculateContradictionPenalty(moduleScores: Record<string, ModuleResult>): number {
    // Check if any module says bullish while another says bearish
    const directions: string[] = [];
    for (const [_, result] of Object.entries(moduleScores)) {
      const score = result.score || 50;
      if (score > 60) directions.push('bullish');
      else if (score < 40) directions.push('bearish');
      else directions.push('neutral');
    }
    const bullish = directions.filter((d) => d === 'bullish').length;
    const bearish = directions.filter((d) => d === 'bearish').length;
    if (bullish > 0 && bearish > 0) {
      return Math.min(0.15, 0.05 * Math.min(bullish, bearish));
    }
    return 0;
  }
}