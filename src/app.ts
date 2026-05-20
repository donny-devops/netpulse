import express from 'express';
import { requestLogger } from './middleware/logger';
import { rateLimiter } from './middleware/rateLimiter';
import healthRouter from './routes/health';
import webhookRouter from './routes/webhook';

const app = express();

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Global middleware
app.use(requestLogger);
app.use(rateLimiter);

// Routes
app.use('/health', healthRouter);
app.use('/webhook', webhookRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ success: false, error: err.message ?? 'Internal server error' });
});

export default app;
