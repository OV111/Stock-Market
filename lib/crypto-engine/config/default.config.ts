import { TimeHorizon } from "../types";

export interface AppConfig {
  env: "development" | "production" | "test";
  logLevel: "debug" | "info" | "warn" | "error";
  dataCollection: {
    maxRetries: number;
    requestTimeoutMs: number;
    concurrencyLimit: number;
  };
  analysis: {
    defaultHorizon: TimeHorizon;
    minDataCompletenessToRun: number;
    maxProcessingTimeMs: number;
  };
  ai: {
    enableGroq: boolean; // Default: TRUE (Free)
    enableDeepSeek: boolean; // Default: FALSE (Paid)
    enableClaude: boolean; // Default: FALSE (Paid)
    primaryAnalyticalModel: "groq" | "deepseek"; // Default: 'groq'
    useSecondaryForValidation: boolean; // Default: false (to save costs, since no paid secondary)
    groqModel: string;
    groqApiKeyEnv: string;
    deepSeekModel: string;
    deepSeekApiKeyEnv: string;
    claudeModel: string;
    claudeApiKeyEnv: string;
    maxTokens: number;
    temperature: number;
  };
  cache: {
    defaultTtlSeconds: number;
    analysisTtlSeconds: number;
    marketDataTtlSeconds: number;
    onchainDataTtlSeconds: number;
  };
}

export const defaultConfig: AppConfig = {
  env: (process.env.NODE_ENV as any) || "development",
  logLevel: (process.env.LOG_LEVEL as any) || "info",
  dataCollection: {
    maxRetries: 3,
    requestTimeoutMs: 10000,
    concurrencyLimit: 5,
  },
  analysis: {
    defaultHorizon: "medium",
    minDataCompletenessToRun: 0.6,
    maxProcessingTimeMs: 30000,
  },
  ai: {
    // FREE TIER PRIORITY
    enableGroq: true,
    enableDeepSeek: false, // Only enable if user explicitly adds DEEPSEEK_API_KEY
    enableClaude: false, // Only enable if user explicitly adds ANTHROPIC_API_KEY
    primaryAnalyticalModel: "groq",
    useSecondaryForValidation: false, // Keep false for free usage
    groqModel: "llama3-70b-8192", // Best free model on Groq
    groqApiKeyEnv: "GROQ_API_KEY",
    deepSeekModel: "deepseek-reasoner",
    deepSeekApiKeyEnv: "DEEPSEEK_API_KEY",
    claudeModel: "claude-3-5-sonnet-20241022",
    claudeApiKeyEnv: "ANTHROPIC_API_KEY",
    maxTokens: 4096,
    temperature: 0.3,
  },
  cache: {
    defaultTtlSeconds: 300,
    analysisTtlSeconds: 900,
    marketDataTtlSeconds: 60,
    onchainDataTtlSeconds: 1800,
  },
};
