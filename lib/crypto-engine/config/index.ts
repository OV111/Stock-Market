import { defaultConfig, AppConfig } from "./default.config";
import {
  dataSources,
  sourcePriority,
  getApiKey,
  isSourceUsable,
} from "./data-sources";
import {
  getWeightsForCategory,
  adjustWeightsForMarketPhase,
  BASE_WEIGHTS,
} from "./scoring-weights";
import { CACHE_TTL, getCacheKey, CACHE_PREFIX } from "./cache-ttl";

export const config: AppConfig = {
  ...defaultConfig,
  // Auto-disable AI providers if their keys are missing (Free-tier safety)
  ai: {
    ...defaultConfig.ai,
    enableGroq:
      defaultConfig.ai.enableGroq &&
      !!process.env[defaultConfig.ai.groqApiKeyEnv],
    enableDeepSeek:
      defaultConfig.ai.enableDeepSeek &&
      !!process.env[defaultConfig.ai.deepSeekApiKeyEnv],
    enableClaude:
      defaultConfig.ai.enableClaude &&
      !!process.env[defaultConfig.ai.claudeApiKeyEnv],
  },
};

export {
  dataSources,
  sourcePriority,
  getApiKey,
  isSourceUsable,
  getWeightsForCategory,
  adjustWeightsForMarketPhase,
  BASE_WEIGHTS,
  CACHE_TTL,
  getCacheKey,
  CACHE_PREFIX,
};

export function getConfigFor(
  module: "dataCollection" | "analysis" | "ai" | "cache",
) {
  switch (module) {
    case "dataCollection":
      return config.dataCollection;
    case "analysis":
      return config.analysis;
    case "ai":
      return config.ai;
    case "cache":
      return config.cache;
    default:
      return config;
  }
}

export default config;
