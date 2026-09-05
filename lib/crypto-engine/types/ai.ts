// types/ai.ts
import { SentimentBias, RecommendationType, TimeHorizon, RiskCategory, AIProvider } from './enums';
import { MarketData } from './market-data';
import { TechnicalIndicators } from './technical';
import { FundamentalData } from './fundamental';
import { TokenomicsData } from './tokenomics';
import { OnChainData } from './onchain';
import { NewsAnalysisSummary } from './news';
import { MacroContext } from './macro';
import { ModuleScore, Evidence } from './scores';

// --- SHARED BASE INPUT (Used by Groq & DeepSeek) ---
export interface AnalyticalAIInput {
  asset: { id: string; name: string; symbol: string; marketCapRank: number };
  market_data: MarketData;
  technical_indicators: TechnicalIndicators;
  fundamental_data: FundamentalData;
  tokenomics: TokenomicsData;
  onchain_data: OnChainData | null;
  news_summary: NewsAnalysisSummary;
  macro_context: MacroContext;
}

// --- SHARED OUTPUT STRUCTURES ---
export interface AIContradiction {
  factor1: string;
  factor2: string;
  resolution: string;
  confidence: number; // 0-1
}

export interface AIHiddenRisk {
  risk: string;
  description: string;
  probability: number; // 0-1
  severity: number; // 0-1
}

export interface AIIndependentConclusion {
  summary: string;
  overallBias: SentimentBias;
  confidence: number; // 0-1
}

export interface AIFactor {
  factor: string;
  evidence: string;
  weight: number; // 0-1
  confidence: number; // 0-1
}

// --- DEEPSEEK OUTPUT ---
export interface DeepSeekOutput {
  analysis: {
    bullish_factors: AIFactor[];
    bearish_factors: AIFactor[];
    contradictions: AIContradiction[];
    unusual_metrics: { metric: string; value: number; historical_average: number; significance: string }[];
    hidden_risks: AIHiddenRisk[];
    independent_conclusion: AIIndependentConclusion;
    assumptions: { assumption: string; challenge: string; alternative: string }[];
    data_quality_notes: { issue: string; impact: string; recommendation: string }[];
  };
  scores: {
    fundamental: ModuleScore;
    technical: ModuleScore;
    tokenomics: ModuleScore;
    onchain: ModuleScore;
    sentiment: ModuleScore;
    risk: ModuleScore;
    macro: ModuleScore;
    overall: ModuleScore;
  };
  metadata: { timestamp: string; model: string; version: string; processing_time_ms: number; data_freshness: any };
}

// --- GROQ OUTPUT (Identical structure to DeepSeek, but explicitly typed for alias clarity) ---
// This ensures the validators work seamlessly for both.
export interface GroqOutput extends DeepSeekOutput {
  metadata: DeepSeekOutput['metadata'] & { model: 'groq-llama3' | 'groq-mixtral' };
}

// --- CLAUDE OUTPUT ---
export interface ClaudeReason {
  reason: string;
  evidence: string[];
  strength: number; // 0-1
}

export interface ClaudeRiskFactor {
  risk: string;
  category: RiskCategory;
  severity: number; // 0-1
  probability: number; // 0-1
  mitigation: string;
}

export interface ClaudeOutlook {
  description: string;
  direction: SentimentBias;
  confidence: number; // 0-1
  key_factors: string[];
}

export interface ClaudeInput {
  asset_metadata: { id: string; name: string; symbol: string; logoUrl?: string };
  processed_data: {
    market: MarketData;
    technical: TechnicalIndicators;
    fundamental: FundamentalData;
    tokenomics: TokenomicsData;
    onchain: OnChainData | null;
    news: NewsAnalysisSummary;
    macro: MacroContext;
  };
  scoring_results: { modules: Record<string, ModuleScore>; overall: ModuleScore };
  deepseek_analysis?: DeepSeekOutput; // Optional if Groq is used
  groq_analysis?: GroqOutput;         // Optional if DeepSeek is used
  evidence_chain: Evidence[];
}

export interface ClaudeOutput {
  analysis: {
    summary: string;
    investment_thesis: string;
    bull_case: string;
    bear_case: string;
    reasons_to_consider: { items: ClaudeReason[]; summary: string };
    reasons_to_avoid: { items: Omit<ClaudeReason, 'strength'> & { severity: number }[]; summary: string };
    risk_analysis: { overall_risk_level: 'low' | 'medium' | 'high'; risk_factors: ClaudeRiskFactor[]; summary: string };
    catalysts: { event: string; timing: TimeHorizon; impact: 'high' | 'medium' | 'low'; probability: number }[];
    invalidation_conditions: { condition: string; metric: string; threshold: string | number }[];
  };
  outlook: { short_term: ClaudeOutlook; medium_term: ClaudeOutlook; long_term: ClaudeOutlook };
  recommendation: { overall: RecommendationType; confidence: number; time_horizon: TimeHorizon; conditions: string };
  scores: { overall_attractiveness: number; confidence: number; risk_adjusted_score: number };
  disclaimers: string[];
  metadata: { timestamp: string; model: string; version: string; processing_time_ms: number; data_sources: string[] };
}