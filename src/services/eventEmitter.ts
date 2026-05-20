import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface WebhookEvent {
  id: string;
  source: string;
  payload: Record<string, unknown>;
  receivedAt: string;
  headers: Record<string, string>;
}

export type NetPulseEventMap = {
  'webhook:received': [event: WebhookEvent];
  'webhook:processed': [event: WebhookEvent];
  'webhook:failed': [event: WebhookEvent, error: Error];
};

class NetPulseEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20);
  }

  emitWebhookReceived(event: WebhookEvent): boolean {
    logger.debug('Event emitted: webhook:received', { id: event.id, source: event.source });
    return this.emit('webhook:received', event);
  }

  emitWebhookProcessed(event: WebhookEvent): boolean {
    logger.debug('Event emitted: webhook:processed', { id: event.id, source: event.source });
    return this.emit('webhook:processed', event);
  }

  emitWebhookFailed(event: WebhookEvent, error: Error): boolean {
    logger.error('Event emitted: webhook:failed', { id: event.id, source: event.source, error: error.message });
    return this.emit('webhook:failed', event, error);
  }
}

export const eventEmitter = new NetPulseEventEmitter();
