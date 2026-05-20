import app from './app';
import { config } from './utils/config';
import { logger } from './utils/logger';
import { eventEmitter } from './services/eventEmitter';
import { queueService } from './services/queueService';

const server = app.listen(config.port, () => {
  logger.info(`NetPulse started`, { port: config.port, env: config.nodeEnv });
});

// Async event processing: log every received webhook
eventEmitter.on('webhook:received', (event) => {
  logger.info('Processing webhook event', { id: event.id, source: event.source });
});

// Graceful shutdown
async function shutdown(): Promise<void> {
  logger.info('Shutting down...');
  server.close(async () => {
    await queueService.disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

export default server;
