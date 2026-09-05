import { BaseCollector } from '../base-collector';
import { DataSourceConfig } from '../../config/data-sources';
import { dataSources } from '../../config';
import { DeveloperActivity } from '../../types';

export class GitHubCollector extends BaseCollector {
  protected loadConfig(): DataSourceConfig {
    return dataSources.github;
  }

  protected async fetchData(endpoint: string, params?: Record<string, any>): Promise<any> {
    return this.get(endpoint, params);
  }

  /**
   * Get developer activity for a GitHub repo
   */
  async getDevActivity(repoOwner: string, repoName: string): Promise<DeveloperActivity> {
    // Get the repository
    const repo = await this.fetchData(`/repos/${repoOwner}/${repoName}`);

    // Get commit activity (last 30 days)
    const commitActivity = await this.fetchData(
      `/repos/${repoOwner}/${repoName}/stats/commit_activity`
    );

    // Get contributors (active devs in last 30 days)
    const contributors = await this.fetchData(
      `/repos/${repoOwner}/${repoName}/stats/contributors`
    );

    // Calculate commits in last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    let recentCommits = 0;

    if (Array.isArray(commitActivity)) {
      // commitActivity is array of { week: timestamp, total: number }
      for (const week of commitActivity) {
        const weekDate = new Date(week.week * 1000);
        if (weekDate >= thirtyDaysAgo) {
          recentCommits += week.total || 0;
        }
      }
    }

    // Active devs: contributors with commits in last 30 days
    let activeDevs = 0;
    if (Array.isArray(contributors)) {
      for (const contributor of contributors) {
        // Check if they have recent commits (weeks array)
        if (contributor.weeks) {
          let hasRecent = false;
          for (const week of contributor.weeks) {
            const weekDate = new Date(week.w * 1000);
            if (weekDate >= thirtyDaysAgo && week.c > 0) {
              hasRecent = true;
              break;
            }
          }
          if (hasRecent) activeDevs++;
        }
      }
    }

    return {
      commits30d: recentCommits,
      activeDevs30d: activeDevs || contributorCount(contributors),
      trend: this.calculateTrend(commitActivity),
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    };
  }

  private calculateTrend(commitActivity: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (!Array.isArray(commitActivity) || commitActivity.length < 8) return 'stable';
    const recent = commitActivity.slice(-4);
    const older = commitActivity.slice(-8, -4);
    const avgRecent = recent.reduce((a, b) => a + (b.total || 0), 0) / recent.length;
    const avgOlder = older.reduce((a, b) => a + (b.total || 0), 0) / older.length;
    const ratio = avgRecent / (avgOlder || 1);
    if (ratio > 1.2) return 'increasing';
    if (ratio < 0.8) return 'decreasing';
    return 'stable';
  }

  private contributorCount(contributors: any[]): number {
    return Array.isArray(contributors) ? contributors.length : 0;
  }
}