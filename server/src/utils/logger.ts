const isDev = process.env.NODE_ENV !== 'production';

const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg: string, ...args: unknown[]): void => {
    if (isDev) console.log(`[${timestamp()}] INFO  ${msg}`, ...args);
  },
  warn: (msg: string, ...args: unknown[]): void => {
    console.warn(`[${timestamp()}] WARN  ${msg}`, ...args);
  },
  error: (msg: string, ...args: unknown[]): void => {
    console.error(`[${timestamp()}] ERROR ${msg}`, ...args);
  },
};
