import { RiskCategory } from "./enums";

export interface RiskFactor {
  id: string;
  category: RiskCategory;
  description: string;
  severity: number; // 0-100
  probability: number; // 0-100
  evidence: string[];
  mitigation: string;
  timeframe: "short" | "medium" | "long";
  dataSources: string[];
  confidence: number; // 0-100
}

export interface RiskAssessment {
  overallRiskLevel: "low" | "medium" | "high";
  riskScore: number; // 0-100 (higher = more risk)
  confidence: number;
  riskFactors: RiskFactor[];
  highRiskCount: number;
  summary: string;
}
