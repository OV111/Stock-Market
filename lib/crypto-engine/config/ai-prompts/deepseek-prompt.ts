// config/ai-prompts/deepseek-prompt.ts
import { DeepSeekInput } from '../../types';

export function buildDeepSeekSystemPrompt(): string {
  return `
You are a senior quantitative crypto analyst. Your task is to analyze structured market data, identify patterns, detect risks, and produce independent conclusions.

CRITICAL RULES:
1. You MUST base ALL conclusions on the data provided. Do NOT invent data.
2. Distinguish between facts, calculated metrics, and your interpretation.
3. Identify contradictions in the data. If signals conflict, say so.
4. Challenge assumptions. What might be misleading in the data?
5. Identify hidden risks that might not be obvious.
6. Assign confidence scores to each of your findings (0-1).
7. Return ONLY valid JSON matching the required schema.

OUTPUT SCHEMA REQUIREMENTS:
{
  "analysis": {
    "bullish_factors": [{ "factor": "string", "evidence": "string", "weight": 0-1, "confidence": 0-1 }],
    "bearish_factors": [...],
    "contradictions": [{ "factor1": "string", "factor2": "string", "resolution": "string", "confidence": 0-1 }],
    "unusual_metrics": [{ "metric": "string", "value": number, "historical_average": number, "significance": "string" }],
    "hidden_risks": [{ "risk": "string", "description": "string", "probability": 0-1, "severity": 0-1 }],
    "independent_conclusion": { "summary": "string", "overall_bias": "bullish|neutral|bearish", "confidence": 0-1 },
    "assumptions": [{ "assumption": "string", "challenge": "string", "alternative": "string" }],
    "data_quality_notes": [{ "issue": "string", "impact": "string", "recommendation": "string" }]
  },
  "scores": {
    "fundamental": { "score": 0-100, "confidence": 0-100 },
    "technical": { "score": 0-100, "confidence": 0-100 },
    "tokenomics": { "score": 0-100, "confidence": 0-100 },
    "onchain": { "score": 0-100, "confidence": 0-100 },
    "sentiment": { "score": 0-100, "confidence": 0-100 },
    "risk": { "score": 0-100, "confidence": 0-100 },
    "macro": { "score": 0-100, "confidence": 0-100 },
    "overall": { "score": 0-100, "confidence": 0-100 }
  },
  "metadata": { ... }
}

Be critical. Do not just say "buy" or "sell". Reason from evidence.
`;
}

export function buildDeepSeekUserPrompt(input: DeepSeekInput): string {
  return `
Analyze the following crypto asset data:

ASSET: ${input.asset.name} (${input.asset.symbol}) | Rank: #${input.asset.marketCapRank}

--- MARKET DATA ---
Price: $${input.market_data.priceUsd.toLocaleString()}
Market Cap: $${(input.market_data.marketCap / 1e9).toFixed(2)}B
24h Volume: $${(input.market_data.volume24h / 1e6).toFixed(0)}M
24h Change: ${input.market_data.priceChange24h > 0 ? '+' : ''}${input.market_data.priceChange24h.toFixed(2)}%
7d Change: ${input.market_data.priceChange7d > 0 ? '+' : ''}${input.market_data.priceChange7d.toFixed(2)}%
30d Change: ${input.market_data.priceChange30d > 0 ? '+' : ''}${input.market_data.priceChange30d.toFixed(2)}%
Volatility (30d): ${input.market_data.volatility30d.toFixed(1)}%
Circulating Supply: ${(input.market_data.circulatingSupply / 1e6).toFixed(2)}M
ATH: $${input.market_data.ath.toLocaleString()} (${new Date(input.market_data.athDate || '').toLocaleDateString()})
ATL: $${input.market_data.atl.toLocaleString()}

--- TECHNICAL INDICATORS ---
RSI (14): ${input.technical_indicators.rsi14.toFixed(1)}
MACD: ${input.technical_indicators.macd.value.toFixed(2)} (signal: ${input.technical_indicators.macd.signal.toFixed(2)})
EMA 20: $${input.technical_indicators.ema20.toFixed(2)}
EMA 50: $${input.technical_indicators.ema50.toFixed(2)}
EMA 200: $${input.technical_indicators.ema200.toFixed(2)}
Trend: ${input.technical_indicators.trend} (strength: ${(input.technical_indicators.trendStrength * 100).toFixed(0)}%)
Support Levels: ${input.technical_indicators.supportLevels.map(s => `$${s.toFixed(0)}`).join(', ')}
Resistance Levels: ${input.technical_indicators.resistanceLevels.map(s => `$${s.toFixed(0)}`).join(', ')}

--- FUNDAMENTALS ---
Use Case: ${input.fundamental_data.useCase}
Consensus: ${input.fundamental_data.consensusMechanism}
Active Devs (30d): ${input.fundamental_data.developerActivity.activeDevs30d}
Commits (30d): ${input.fundamental_data.developerActivity.commits30d}
Dev Trend: ${input.fundamental_data.developerActivity.trend}
Active Addresses (30d): ${input.fundamental_data.ecosystem.activeAddresses30d?.toLocaleString() || 'N/A'}
TVL: $${(input.fundamental_data.ecosystem.tvl || 0).toLocaleString()}

--- TOKENOMICS ---
Circulating: ${(input.tokenomics.circulatingSupply / 1e6).toFixed(2)}M
Total Supply: ${(input.tokenomics.totalSupply / 1e6).toFixed(2)}M
Max Supply: ${input.tokenomics.maxSupply ? (input.tokenomics.maxSupply / 1e6).toFixed(2) + 'M' : 'Unlimited'}
Inflation Rate: ${input.tokenomics.inflationRate.toFixed(2)}%
Unlocks Next 6m: ${(input.tokenomics.unlocksNext6m / 1e6).toFixed(2)}M tokens
Staking Yield: ${input.tokenomics.stakingYield ? input.tokenomics.stakingYield.toFixed(2) + '%' : 'N/A'}

--- ON-CHAIN DATA ---
${input.onchain_data ? `
Active Addresses: ${input.onchain_data.activeAddresses.current.toLocaleString()} (30d change: ${input.onchain_data.activeAddresses.change30d > 0 ? '+' : ''}${input.onchain_data.activeAddresses.change30d.toFixed(1)}%)
Daily Txs: ${input.onchain_data.transactionCount.daily.toLocaleString()}
Exchange Net Flow: ${input.onchain_data.exchangeFlows.netFlow > 0 ? 'Inflow' : 'Outflow'} (${Math.abs(input.onchain_data.exchangeFlows.netFlow).toLocaleString()} tokens)
Whale Accumulation: ${input.onchain_data.whaleActivity.whaleAccumulation ? 'Yes' : 'No'}
Network Health: ${(input.onchain_data.networkHealth * 100).toFixed(0)}%
` : 'No on-chain data available for this asset.'}

--- NEWS & SENTIMENT ---
Overall Sentiment: ${(input.news_summary.overallSentiment * 100).toFixed(0)}%
Positive Articles: ${input.news_summary.positiveCount}
Negative Articles: ${input.news_summary.negativeCount}
Top Topics: ${input.news_summary.topTopics.join(', ')}
Recent Catalysts: ${input.news_summary.recentCatalysts.join('; ')}
Recent Risks: ${input.news_summary.recentRisks.join('; ')}

--- MACRO CONTEXT ---
BTC Trend: ${input.macro_context.btcTrend}
Total Market Cap: $${(input.macro_context.totalMarketCap / 1e9).toFixed(2)}B
BTC Dominance: ${input.macro_context.btcDominance.toFixed(1)}%
Fear & Greed: ${input.macro_context.fearAndGreedIndex}
Risk Environment: ${input.macro_context.riskEnvironment}
Correlation to BTC: ${input.macro_context.correlationToBtc.toFixed(2)}

Provide your analysis following the JSON schema. Be thorough, evidence-driven, and critical.
`;
}