// config/ai-prompts/claude-prompt.ts
import { ClaudeInput, DeepSeekOutput } from '../../types';

export function buildClaudeSystemPrompt(): string {
  return `
You are a senior crypto investment analyst and AI synthesis expert. Your task is to synthesize multiple data sources, verified metrics, and DeepSeek's analytical output into a coherent, evidence-driven investment thesis.

CRITICAL RULES:
1. YOU MUST verify DeepSeek's reasoning. If DeepSeek hallucinated or made unsupported claims, flag it.
2. Resolve conflicting signals. If evidence contradicts, explain the tension and weigh both sides.
3. NEVER invent missing data. If data is absent, say "insufficient data" and reduce confidence.
4. Distinguish clearly: facts vs. calculated metrics vs. interpretation vs. assumptions vs. predictions.
5. Produce a user-friendly narrative that explains WHY someone might buy or avoid this asset.
6. Be explicit about uncertainty. Use confidence scores honestly.
7. Return ONLY valid JSON matching the required schema.

OUTPUT SCHEMA:
{
  "analysis": {
    "summary": "string (2-3 sentences)",
    "investment_thesis": "string (detailed narrative)",
    "bull_case": "string",
    "bear_case": "string",
    "reasons_to_consider": { "items": [{ "reason": "string", "evidence": ["string"], "strength": 0-1 }], "summary": "string" },
    "reasons_to_avoid": { "items": [{ "reason": "string", "evidence": ["string"], "severity": 0-1 }], "summary": "string" },
    "risk_analysis": {
      "overall_risk_level": "low|medium|high",
      "risk_factors": [{ "risk": "string", "category": "string", "severity": 0-1, "probability": 0-1, "mitigation": "string" }],
      "summary": "string"
    },
    "catalysts": [{ "event": "string", "timing": "short|medium|long", "impact": "high|medium|low", "probability": 0-1 }],
    "invalidation_conditions": [{ "condition": "string", "metric": "string", "threshold": "string|number" }]
  },
  "outlook": {
    "short_term": { "description": "string", "direction": "bullish|neutral|bearish", "confidence": 0-1, "key_factors": ["string"] },
    "medium_term": { ... },
    "long_term": { ... }
  },
  "recommendation": {
    "overall": "strong_opportunity|potential_opportunity|watch|neutral|high_risk|avoid",
    "confidence": 0-1,
    "time_horizon": "short|medium|long",
    "conditions": "string"
  },
  "scores": {
    "overall_attractiveness": 0-1,
    "confidence": 0-1,
    "risk_adjusted_score": 0-1
  },
  "disclaimers": ["string"],
  "metadata": { ... }
}

Be objective. Do not give financial advice—frame everything as "based on available evidence".
`;
}

export function buildClaudeUserPrompt(
  input: ClaudeInput,
  deepseekOutput: DeepSeekOutput
): string {
  // Build a summary of the data for Claude to synthesize
  const dataSummary = `
ASSET: ${input.asset_metadata.name} (${input.asset_metadata.symbol})

PRICE: $${input.processed_data.market.priceUsd.toLocaleString()}
MARKET CAP: $${(input.processed_data.market.marketCap / 1e9).toFixed(2)}B
24H CHANGE: ${input.processed_data.market.priceChange24h > 0 ? '+' : ''}${input.processed_data.market.priceChange24h.toFixed(2)}%
VOLATILITY (30D): ${input.processed_data.market.volatility30d.toFixed(1)}%

TECHNICAL: RSI=${input.processed_data.technical.rsi14.toFixed(1)}, Trend=${input.processed_data.technical.trend}, Trend Strength=${(input.processed_data.technical.trendStrength * 100).toFixed(0)}%

FUNDAMENTAL SCORE: ${(input.scoring_results.modules.fundamental?.score || 0).toFixed(0)}/100
TOKENOMICS SCORE: ${(input.scoring_results.modules.tokenomics?.score || 0).toFixed(0)}/100
ONCHAIN SCORE: ${(input.scoring_results.modules.onchain?.score || 0).toFixed(0)}/100
SENTIMENT SCORE: ${(input.scoring_results.modules.sentiment?.score || 0).toFixed(0)}/100
RISK SCORE: ${(input.scoring_results.modules.risk?.score || 0).toFixed(0)}/100
MACRO SCORE: ${(input.scoring_results.modules.macro?.score || 0).toFixed(0)}/100
OVERALL ATTRACTIVENESS: ${(input.scoring_results.overall.score || 0).toFixed(0)}/100
OVERALL CONFIDENCE: ${(input.scoring_results.overall.confidence || 0).toFixed(0)}%

DEEPSEEK INDEPENDENT CONCLUSION: ${deepseekOutput.analysis.independent_conclusion.summary}
DEEPSEEK BIAS: ${deepseekOutput.analysis.independent_conclusion.overallBias} (conf: ${(deepseekOutput.analysis.independent_conclusion.confidence * 100).toFixed(0)}%)

DEEPSEEK BULLISH FACTORS:
${deepseekOutput.analysis.bullish_factors.map(f => `- ${f.factor} (weight: ${(f.weight * 100).toFixed(0)}%, conf: ${(f.confidence * 100).toFixed(0)}%)`).join('\n')}

DEEPSEEK BEARISH FACTORS:
${deepseekOutput.analysis.bearish_factors.map(f => `- ${f.factor} (weight: ${(f.weight * 100).toFixed(0)}%, conf: ${(f.confidence * 100).toFixed(0)}%)`).join('\n')}

DEEPSEEK CONTRADICTIONS:
${deepseekOutput.analysis.contradictions.map(c => `- ${c.factor1} vs ${c.factor2} → ${c.resolution}`).join('\n') || 'None detected'}

DEEPSEEK HIDDEN RISKS:
${deepseekOutput.analysis.hidden_risks.map(r => `- ${r.risk}: ${r.description} (prob: ${(r.probability * 100).toFixed(0)}%, severity: ${(r.severity * 100).toFixed(0)}%)`).join('\n') || 'None identified'}

DATA QUALITY NOTES:
${deepseekOutput.analysis.data_quality_notes.map(n => `- ${n.issue}: ${n.impact}`).join('\n') || 'No major issues'}

Now, synthesize all this information into a coherent investment thesis. Produce the final JSON output following the schema exactly.
`;
}