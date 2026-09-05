import logger from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableErrors?: Array<(error: Error) => boolean>;
  onRetry?: (error: Error, attempt: number) => void;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2,
  retryableErrors: [
    (e) => e.message.includes('ECONNRESET'),
    (e) => e.message.includes('ETIMEDOUT'),
    (e) => e.message.includes('rate limit'),
    (e) => e.message.includes('429'),
    (e) => e.message.includes('503'),
    (e) => e.message.includes('500'),
  ],
  onRetry: (error, attempt) => {
    logger.warn({ error: error.message, attempt }, 'Retrying operation');
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options } as Required<RetryOptions>;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // If this is the last attempt, rethrow
      if (attempt === opts.maxRetries) break;

      // Check if error is retryable
      const isRetryable = opts.retryableErrors.some((predicate) => predicate(lastError!));
      if (!isRetryable) break;

      // Calculate delay with jitter
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelayMs
      );
      const jitter = Math.random() * 200;
      const totalDelay = delay + jitter;

      opts.onRetry(lastError, attempt + 1);

      // Wait before retrying
      await sleep(totalDelay);
    }
  }

  throw lastError;
}

// Helper sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}