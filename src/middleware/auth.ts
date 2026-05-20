import { Request, Response, NextFunction } from 'express';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== config.apiKey) {
    logger.warn('Unauthorized request', { path: req.path, ip: req.ip });
    res.status(401).json({
      success: false,
      error: 'Unauthorized: missing or invalid API key',
    });
    return;
  }

  next();
}
