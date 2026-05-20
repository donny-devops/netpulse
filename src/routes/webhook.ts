import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { eventEmitter, WebhookEvent } from '../services/eventEmitter';
import { queueService } from '../services/queueService';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

router.post('/:source', authenticate, async (req: Request, res: Response) => {
  const { source } = req.params;
  const event: WebhookEvent = {
    id: uuidv4(),
    source: source,
    payload: req.body as Record<string, unknown>,
    receivedAt: new Date().toISOString(),
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, String(v)])
    ),
  };

  logger.info('Webhook received', { id: event.id, source: event.source });

  eventEmitter.emitWebhookReceived(event);

  try {
    await queueService.enqueue(event);
    eventEmitter.emitWebhookProcessed(event);

    res.status(202).json({
      success: true,
      message: 'Webhook accepted',
      eventId: event.id,
      source: event.source,
      receivedAt: event.receivedAt,
    });
  } catch (err) {
    const error = err as Error;
    eventEmitter.emitWebhookFailed(event, error);
    logger.error('Failed to process webhook', { id: event.id, error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
    });
  }
});

export default router;
