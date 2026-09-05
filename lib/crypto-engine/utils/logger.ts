// utils/logger.ts
import pino from 'pino'; // You'll need to install: npm i pino pino-pretty

const isDev = process.env.NODE_ENV !== 'production';

// Configure pino for structured logging
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'crypto-engine',
  },
});

// Child logger helper (useful for adding context like assetId, requestId)
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context);
}

// Export a default instance
export default logger;