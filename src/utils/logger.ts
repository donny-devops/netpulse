import winston from 'winston';
import { config } from './config';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

const developmentFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  simple()
);

const productionFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format: config.nodeEnv === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { service: 'netpulse' },
  transports: [
    new winston.transports.Console(),
  ],
  silent: config.nodeEnv === 'test',
});
