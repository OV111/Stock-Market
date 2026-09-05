export class CryptoEngineError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;
  public readonly isRetryable: boolean;

  constructor(message: string, code: string, context?: Record<string, any>, isRetryable = false) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.isRetryable = isRetryable;
    Error.captureStackTrace(this, this.constructor);
  }
}

// --- Data Collection Errors ---
export class DataCollectionError extends CryptoEngineError {
  constructor(message: string, source: string, context?: Record<string, any>, isRetryable = true) {
    super(message, 'DATA_COLLECTION_ERROR', { ...context, source }, isRetryable);
  }
}

export class RateLimitError extends CryptoEngineError {
  constructor(source: string, retryAfterSeconds?: number) {
    super(
      `Rate limit exceeded for ${source}`,
      'RATE_LIMIT_ERROR',
      { source, retryAfterSeconds },
      true
    );
  }
}

export class DataValidationError extends CryptoEngineError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATA_VALIDATION_ERROR', context, false); // Not retryable
  }
}

// --- AI Errors ---
export class AIServiceError extends CryptoEngineError {
  constructor(message: string, provider: string, context?: Record<string, any>, isRetryable = true) {
    super(message, 'AI_SERVICE_ERROR', { ...context, provider }, isRetryable);
  }
}

export class AIHallucinationError extends CryptoEngineError {
  constructor(message: string, provider: string, context?: Record<string, any>) {
    super(message, 'AI_HALLUCINATION_ERROR', { ...context, provider }, false); // Not retryable
  }
}

// --- Configuration Errors ---
export class ConfigError extends CryptoEngineError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIG_ERROR', context, false);
  }
}

// --- Cache Errors ---
export class CacheError extends CryptoEngineError {
  constructor(message: string, context?: Record<string, any>, isRetryable = true) {
    super(message, 'CACHE_ERROR', context, isRetryable);
  }
}

// --- Scoring Errors ---
export class ScoringError extends CryptoEngineError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SCORING_ERROR', context, false);
  }
}