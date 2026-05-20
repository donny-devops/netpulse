import Redis from 'ioredis';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { WebhookEvent } from './eventEmitter';

const WEBHOOK_QUEUE_KEY = 'netpulse:webhook:queue';

const MAX_REDIS_RECONNECT_ATTEMPTS = 3;

export class QueueService {
  private client: Redis | null = null;
  private readonly enabled: boolean;

  constructor() {
    this.enabled = config.redis.enabled;
    if (this.enabled) {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        lazyConnect: true,
        enableOfflineQueue: false,
        retryStrategy: (times) => {
          if (times > MAX_REDIS_RECONNECT_ATTEMPTS) {
            logger.error('Redis: max reconnect attempts reached');
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      });

      this.client.on('connect', () => logger.info('Redis connected'));
      this.client.on('error', (err: Error) => logger.error('Redis error', { error: err.message }));
    }
  }

  async enqueue(event: WebhookEvent): Promise<void> {
    if (!this.enabled || !this.client) {
      logger.debug('Queue disabled — skipping enqueue', { id: event.id });
      return;
    }
    try {
      await this.client.rpush(WEBHOOK_QUEUE_KEY, JSON.stringify(event));
      logger.debug('Event enqueued', { id: event.id, source: event.source });
    } catch (err) {
      logger.error('Failed to enqueue event', { id: event.id, error: (err as Error).message });
      throw err;
    }
  }

  async dequeue(): Promise<WebhookEvent | null> {
    if (!this.enabled || !this.client) {
      return null;
    }
    try {
      const raw = await this.client.lpop(WEBHOOK_QUEUE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as WebhookEvent;
    } catch (err) {
      logger.error('Failed to dequeue event', { error: (err as Error).message });
      throw err;
    }
  }

  async queueLength(): Promise<number> {
    if (!this.enabled || !this.client) {
      return 0;
    }
    return this.client.llen(WEBHOOK_QUEUE_KEY);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

export const queueService = new QueueService();
