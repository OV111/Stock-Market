// Weighted sentiment, Recency decay, Fear & Greed
import { DataPackage } from '../../types/data-package';
import { ModuleResult, Evidence } from '../../types/scores';
import { NewsItem } from '../../types/news';

export class SentimentScorer {
  score(data: DataPackage): ModuleResult {
    const evidence: Evidence[] = [];
    const news = data.news;

    if (!news || news.length === 0) {
      return {
        score: 50,
        confidence: 20,
        evidence: [],
        narrative: 'Insufficient news data for sentiment analysis.',
      };
    }

    // 1. Weighted Sentiment with Recency Decay
    const now = new Date();
    let weightedSum = 0;
    let weightSum = 0;

    for (const item of news) {
      const hoursAgo = (now.getTime() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
      const recencyWeight = Math.exp(-0.05 * hoursAgo); // λ = 0.05
      const credibility = this.getSourceCredibility(item.source);
      const sentiment = item.sentimentScore; // -1 to 1

      const weight = credibility * recencyWeight;
      weightedSum += sentiment * weight;
      weightSum += weight;
    }

    const rawSentiment = weightSum > 0 ? weightedSum / weightSum : 0; // -1 to 1

    // Map to score 0-100
    const sentimentScore = 50 + rawSentiment * 50;

    evidence.push({
      type: rawSentiment > 0.1 ? 'bullish' : rawSentiment < -0.1 ? 'bearish' : 'neutral',
      category: 'sentiment',
      metric: 'weighted_sentiment',
      value: rawSentiment,
      weight: 0.40,
      source: 'cryptopanic',
      confidence: 0.80,
      description: `Weighted sentiment: ${(rawSentiment * 100).toFixed(0)}% bullish`,
      timestamp: data.collectedAt,
    });

    // 2. Bull/Bear Article Ratio
    const positive = news.filter((n) => n.sentimentScore > 0.2).length;
    const negative = news.filter((n) => n.sentimentScore < -0.2).length;
    const total = news.length;
    const ratio = total > 0 ? (positive - negative) / total : 0; // -1 to 1
    const ratioScore = 50 + ratio * 50;

    evidence.push({
      type: ratio > 0.1 ? 'bullish' : ratio < -0.1 ? 'bearish' : 'neutral',
      category: 'sentiment',
      metric: 'bull_bear_ratio',
      value: ratio,
      weight: 0.25,
      source: 'cryptopanic',
      confidence: 0.85,
      description: `${positive} bullish / ${negative} bearish articles`,
      timestamp: data.collectedAt,
    });

    // 3. Fear & Greed Index (if available)
    let fgScore = 50;
    if (data.macro.fearAndGreedIndex) {
      const fg = data.macro.fearAndGreedIndex;
      // 0-100 → 0-100 score, but contrarian: extreme fear = 70 (buy), extreme greed = 30 (sell)
      let rawFgScore = fg;
      if (fg < 20) rawFgScore = 70; // extreme fear = opportunity
      else if (fg > 80) rawFgScore = 30; // extreme greed = caution
      else rawFgScore = 50 + (fg - 50) * 0.3; // slight pro-cyclical
      fgScore = Math.min(Math.max(rawFgScore, 0), 100);

      evidence.push({
        type: fg < 30 ? 'bullish' : fg > 70 ? 'bearish' : 'neutral',
        category: 'sentiment',
        metric: 'fear_greed',
        value: fg,
        weight: 0.20,
        source: 'alternative.me',
        confidence: 0.90,
        description: `Fear & Greed: ${fg} (${fg < 30 ? 'Fear' : fg > 70 ? 'Greed' : 'Neutral'})`,
        timestamp: data.collectedAt,
      });
    }

    // 4. Sentiment Trend (improving/deteriorating)
    const recent = news.slice(0, Math.min(10, news.length));
    const older = news.slice(Math.min(10, news.length), Math.min(20, news.length));
    const recentSentiment = recent.reduce((sum, n) => sum + n.sentimentScore, 0) / (recent.length || 1);
    const olderSentiment = older.reduce((sum, n) => sum + n.sentimentScore, 0) / (older.length || 1);
    const trend = recentSentiment - olderSentiment;
    const trendScore = 50 + trend * 50;

    evidence.push({
      type: trend > 0.1 ? 'bullish' : trend < -0.1 ? 'bearish' : 'neutral',
      category: 'sentiment',
      metric: 'sentiment_trend',
      value: trend,
      weight: 0.15,
      source: 'cryptopanic',
      confidence: 0.70,
      description: `Sentiment trend: ${trend > 0 ? 'improving' : trend < 0 ? 'deteriorating' : 'stable'}`,
      timestamp: data.collectedAt,
    });

    const score = Math.round(
      sentimentScore * 0.40 +
      ratioScore * 0.25 +
      fgScore * 0.20 +
      trendScore * 0.15
    );

    const confidence = evidence.reduce((sum, e) => sum + e.confidence, 0) / evidence.length * 100;

    return {
      score: Math.min(Math.max(score, 0), 100),
      confidence,
      evidence,
      narrative: `Sentiment score: ${score}/100. ${rawSentiment > 0.1 ? 'Bullish bias' : rawSentiment < -0.1 ? 'Bearish bias' : 'Neutral'}`,
    };
  }

  private getSourceCredibility(source: string): number {
    const credibilityMap: Record<string, number> = {
      'coindesk': 1.0,
      'cointelegraph': 0.9,
      'bloomberg': 1.0,
      'reuters': 1.0,
      'theblock': 0.9,
      'decrypt': 0.8,
      'cryptoslate': 0.7,
      'u.today': 0.6,
      'dailyhodl': 0.5,
    };
    const lower = source.toLowerCase();
    for (const [key, value] of Object.entries(credibilityMap)) {
      if (lower.includes(key)) return value;
    }
    return 0.5; // Unknown source
  }
}