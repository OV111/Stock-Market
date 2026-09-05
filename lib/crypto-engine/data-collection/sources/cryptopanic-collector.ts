import { BaseCollector } from '../base-collector';
import { DataSourceConfig } from '../../config/data-sources';
import { dataSources } from '../../config';
import { NewsItem, NewsCategory } from '../../types';

export class CryptoPanicCollector extends BaseCollector {
  protected loadConfig(): DataSourceConfig {
    return dataSources.cryptopanic;
  }

  protected async fetchData(endpoint: string, params?: Record<string, any>): Promise<any> {
    return this.get(endpoint, params);
  }

  /**
   * Get recent news for an asset
   */
  async getNews(assetId: string, limit: number = 50): Promise<NewsItem[]> {
    const data = await this.fetchData('/posts', {
      currencies: assetId,
      public: true, // Public API
      limit,
    });

    if (!data.results) return [];

    return data.results.map((post: any) => ({
      id: post.id.toString(),
      title: post.title,
      url: post.url,
      source: post.source?.title || 'unknown',
      publishedAt: new Date(post.published_at || post.created_at),
      scrapedAt: new Date(),
      category: this.mapCategory(post.categories || []),
      sentimentScore: this.calculateSentiment(post),
      impactScore: this.calculateImpact(post),
      summary: post.title, // Short summary
      isSignificant: post.important === 1,
    }));
  }

  private mapCategory(categories: string[]): NewsCategory {
    const categoryMap: Record<string, NewsCategory> = {
      'regulation': 'regulatory',
      'technology': 'technological',
      'partnership': 'partnership',
      'adoption': 'adoption',
      'security': 'security',
      'ecosystem': 'ecosystem',
      'macro': 'macroeconomic',
      'competition': 'competitive',
    };
    for (const cat of categories) {
      const mapped = categoryMap[cat.toLowerCase()];
      if (mapped) return mapped;
    }
    return 'social';
  }

  private calculateSentiment(post: any): number {
    // Use CryptoPanic's sentiment if available
    if (post.sentiment) {
      return post.sentiment === 'positive' ? 0.6 : post.sentiment === 'negative' ? -0.6 : 0;
    }
    // Otherwise use the vote ratio
    const ratio = post.votes?.positive / (post.votes?.negative || 1);
    if (ratio > 3) return 0.7;
    if (ratio > 1.5) return 0.3;
    if (ratio > 0.7) return -0.3;
    return -0.6;
  }

  private calculateImpact(post: any): number {
    // Estimate impact based on source credibility and votes
    let impact = 30;
    if (post.important === 1) impact += 30;
    if (post.votes?.positive > 100) impact += 20;
    if (post.votes?.negative > 100) impact += 20;
    return Math.min(impact, 100);
  }
}