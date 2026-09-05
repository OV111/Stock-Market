export type TimeHorizon = "short" | "medium" | "long";

export type RecommendationType =
  | "strong_opportunity"
  | "potential_opportunity"
  | "watch"
  | "neutral"
  | "high_risk"
  | "avoid";

export type RiskCategory =
  | "market"
  | "volatility"
  | "liquidity"
  | "tokenomics"
  | "regulatory"
  | "technology"
  | "smart_contract"
  | "centralization"
  | "governance"
  | "security"
  | "competition"
  | "adoption"
  | "macro";

export type SentimentBias = "bullish" | "bearish" | "neutral";
export type TrendDirection = "uptrend" | "downtrend" | "sideways";
export type NewsCategory =
  | "regulatory"
  | "technological"
  | "partnership"
  | "adoption"
  | "security"
  | "ecosystem"
  | "macroeconomic"
  | "competitive"
  | "social";
export type ConfidenceLevel = "high" | "medium" | "low" | "very_low";
export type AssetCategory =
  | "defi"
  | "layer1"
  | "layer2"
  | "meme"
  | "gaming"
  | "infrastructure"
  | "stablecoin"
  | "other";
export type AIProvider = "groq" | "deepseek" | "claude";
