import { NewsCategory } from "./enums";

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
  scrapedAt: Date;
  category: NewsCategory;
  sentimentScore: number; // -1 to 1
  impactScore: number; // 0-100, estimated market impact
  summary: string;
  isSignificant: boolean;
  content?: string; // raw (sanitized)
}

export interface NewsAnalysisSummary {
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  topTopics: string[];
  overallSentiment: number; // -1 to 1
  recentCatalysts: string[];
  recentRisks: string[];
  sentimentTrend: "improving" | "deteriorating" | "stable";
}
