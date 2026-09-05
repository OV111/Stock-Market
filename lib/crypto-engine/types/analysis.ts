// analysis.ts
import {
  RecommendationType,
  TimeHorizon,
  SentimentBias,
  ConfidenceLevel,
} from "./enums";
import { OverallScore } from "./scores";
import { RiskAssessment } from "./risk";
import { Asset } from "./asset";
import { TechnicalIndicators } from "./technical";
import { FundamentalData } from "./fundamental";
import { TokenomicsData } from "./tokenomics";
import { OnChainData } from "./onchain";
import { NewsAnalysisSummary } from "./news";
import { MacroContext } from "./macro";
import { ModuleScore } from "./scores";
import { RiskFactor } from "./risk";

export interface HorizonOutlook {
  description: string;
  direction: SentimentBias;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  keyFactors: string[];
}

export interface MultiHorizonOutlook {
  shortTerm: HorizonOutlook;
  mediumTerm: HorizonOutlook;
  longTerm: HorizonOutlook;
}

export interface Catalyst {
  event: string;
  timing: TimeHorizon;
  impact: "high" | "medium" | "low";
  probability: number; // 0-1
}

export interface InvalidationCondition {
  condition: string;
  metric: string;
  threshold: string | number;
  timeframe?: TimeHorizon;
}

export interface BuyReason {
  reason: string;
  evidence: string[];
  strength: number; // 0-1
}

export interface AvoidReason {
  reason: string;
  evidence: string[];
  severity: number; // 0-1
}

export interface RecommendationResult {
  overall: RecommendationType;
  confidence: number;
  confidenceLevel: ConfidenceLevel;
  timeHorizon: MultiHorizonOutlook;
  conditions: string;
  rationale: string;
}

export interface AnalysisResult {
  asset: Asset;
  timestamp: Date;
  analysisId: string;
  version: string;
  dataFreshness: {
    marketData: Date;
    onchainData?: Date;
    newsData: Date;
  };
  dataQuality: {
    completeness: number;
    freshness: number;
    reliability: number;
    consistency: number;
    overallQuality: number;
    issues: DataQualityIssue[];
  };
  scores: OverallScore;
  marketAnalysis: ModuleScore & { keyMetrics: any };
  technicalAnalysis: ModuleScore & {
    indicators: TechnicalIndicators;
    supportResistance: any;
  };
  fundamentalAnalysis: ModuleScore & {
    strengths: string[];
    weaknesses: string[];
  };
  tokenomicsAnalysis: ModuleScore & { supplyMetrics: any };
  onchainAnalysis: ModuleScore & { metrics: any; observations: string[] };
  newsAnalysis: ModuleScore & { summary: NewsAnalysisSummary };
  sentimentAnalysis: ModuleScore & {
    overall: SentimentBias;
    contrarianIndicator: string;
  };
  riskAnalysis: RiskAssessment;
  macroAnalysis: ModuleScore & { context: MacroContext };
  valuationAnalysis: ModuleScore & { valuationStatus: string };
  opportunityAnalysis: ModuleScore & {
    catalysts: Catalyst[];
    invalidationConditions: InvalidationCondition[];
  };
  recommendation: RecommendationResult;
  reasonsToConsider: { items: BuyReason[]; summary: string };
  reasonsToAvoid: { items: AvoidReason[]; summary: string };
  bullCase: string;
  bearCase: string;
  catalysts: Catalyst[];
  invalidationConditions: InvalidationCondition[];
  disclaimers: string[];
  metadata: {
    aiModels: string[];
    dataSources: string[];
    processingTimeMs: number;
    isCached: boolean;
  };
}

export interface DataQualityIssue {
  type:
    | "missing_data"
    | "stale_data"
    | "contradictory_data"
    | "suspicious_data"
    | "api_failure";
  severity: "low" | "medium" | "high";
  fields?: string[];
  message: string;
  impact: string;
}
