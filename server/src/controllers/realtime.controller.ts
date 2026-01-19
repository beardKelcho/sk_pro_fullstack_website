import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { pingClient, registerClient, unregisterClient } from '../utils/realtime/realtimeHub';

export const streamRealtime = async (req: Request, res: Response) => {
  // SSE headers - Express otomatik olarak chunked encoding yapar, Transfer-Encoding header'ını kaldır
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    // Transfer-Encoding header'ını kaldırdık - Express otomatik olarak chunked encoding yapar
  });

  // flush headers if available
  // @ts-ignore
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const user = req.user as any;
  const userId = String(user?._id || user?.id || '');
  const role = String(user?.role || '');
  const permissions = Array.isArray(user?.permissions) ? (user.permissions as string[]) : [];

  if (!userId) {
    return res.end();
  }

  const clientId = uuidv4();

  registerClient({
    id: clientId,
    userId,
    role,
    permissions,
    res,
  });

  const heartbeat = setInterval(() => pingClient(clientId), 25_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unregisterClient(clientId);
    try {
      res.end();
    } catch {
      // ignore
    }
  });

  logger.info('Realtime SSE bağlandı', { clientId, userId, role });
};

