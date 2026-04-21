/**
 * Simple client-side logger for the web app.
 * Wraps console methods with environment-aware logging.
 * In production, debug logs are silenced.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    console.info(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};

export { logger };
export type { LogLevel };
