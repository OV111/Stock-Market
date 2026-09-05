import { ConfidenceLevel } from "./enums";

export interface ModuleScore {
  score: number; // 0-100
  confidence: number; // 0-100
  evidence: Evidence[];
  narrative?: string;
}

export interface Evidence {
  type: "bullish" | "bearish" | "neutral";
  category: string; // e.g., 'fundamental', 'technical'
  metric: string;
  value: string | number;
  weight: number; // 0-1
  source: string;
  confidence: number; // 0-1
  description: string;
  timestamp: Date;
}

export interface OverallScore {
  score: number; // 0-100
  confidence: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  modules: Record<string, ModuleScore>;
  riskAdjustedScore: number; // score penalized by risk
}

export interface ScoreFactors {
  dataCompleteness: number;
  modelAgreement: number;
  indicatorConsistency: number;
  historicalConsistency: number;
}
