import pino from 'pino';

const globalForPino = globalThis as unknown as {
  pinoLogger: pino.Logger | undefined;
};

export const logger =
  globalForPino.pinoLogger ??
  pino({
    level: process.env.LOG_LEVEL || 'info',
  });

if (process.env.NODE_ENV !== 'production') globalForPino.pinoLogger = logger;
