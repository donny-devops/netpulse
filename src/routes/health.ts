import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'NetPulse',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
