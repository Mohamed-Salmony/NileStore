import { env } from '../config/env';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (env.nodeEnv === 'development') {
      console[level === 'debug' ? 'log' : level](logMessage, meta || '');
    } else if (level !== 'debug') {
      console[level === 'error' ? 'error' : 'log'](logMessage, meta || '');
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
