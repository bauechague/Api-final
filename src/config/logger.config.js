import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from './env.config.js';

const levels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5
};

const colors = {
  fatal: 'magenta',
  error: 'red',
  warning: 'yellow',
  info: 'green',
  http: 'cyan',
  debug: 'white'
};

winston.addColors(colors);

const minLevel = config.nodeEnv === 'production' ? 'info' : 'debug';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`)
);

const logger = winston.createLogger({
  levels,
  level: minLevel,
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize({ all: true }), logFormat)
    }),
    new DailyRotateFile({
      level: 'error',
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      level: minLevel,
      dirname: 'logs',
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d'
    })
  ]
});

export default logger;
