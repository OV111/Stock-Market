import logger, { createChildLogger } from "../utils/logger";
import { withRetry } from "../utils/retry";
import { DataCollectionError, RateLimitError } from "../utils/errors";
import { DataSourceConfig } from "../config/data-sources";
import { isSourceUsable } from "../config";

export abstract class BaseCollector {
  protected sourceName: string;
  protected config: DataSourceConfig;
  protected logger: ReturnType<typeof createChildLogger>;

  constructor(sourceName: string) {
    this.sourceName = sourceName;
    this.config = this.loadConfig();
    this.logger = createChildLogger({ collector: sourceName });
  }

  /** Load config from data-sources.ts */
  protected abstract loadConfig(): DataSourceConfig;

  /** The actual fetch logic – implemented by child classes */
  protected abstract fetchData(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<any>;

  /**
   * Protected HTTP GET with retries and rate limit handling
   */
  // data-collection/base-collector.ts
  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: { retries?: number; timeout?: number },
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    this.logger.debug({ url, source: this.sourceName }, "Fetching data");

    const result = await withRetry(
      async () => {
        const controller = new AbortController();
        // ✅ Increase timeout to 30 seconds
        const timeoutMs = options?.timeout || 30000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
          const response = await fetch(url, {
            headers: this.buildHeaders(),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          // ... rest of response handling
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
      {
        maxRetries: options?.retries || 3, // Retry up to 3 times
        initialDelayMs: 2000, // Start with 2s delay
        maxDelayMs: 30000, // Max 30s between retries
        backoffFactor: 2, // Exponential backoff
        onRetry: (error, attempt) => {
          this.logger.warn(
            { error: error.message, attempt, source: this.sourceName },
            "Retrying request",
          );
        },
      },
    );

    return result as T;
  }

  /** Build full URL with query params */
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.config.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      }
    }
    return url.toString();
  }

  /** Build headers (API keys, content-type) */
  protected buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add API key if required
    const apiKey = this.config.apiKeyEnv
      ? process.env[this.config.apiKeyEnv]
      : undefined;
    if (apiKey) {
      // CoinGecko uses 'x-cg-pro-api-key', others use 'Authorization: Bearer'
      if (this.sourceName === "coingecko" && apiKey) {
        headers["x-cg-pro-api-key"] = apiKey;
      } else {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
    }

    return headers;
  }

  /** Check if source is usable (enabled + API key present) */
  isUsable(): boolean {
    return isSourceUsable(this.sourceName);
  }

  /** Get the name of this collector */
  getName(): string {
    return this.sourceName;
  }
}
