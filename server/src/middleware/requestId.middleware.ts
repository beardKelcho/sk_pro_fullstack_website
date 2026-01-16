import type { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { runWithRequestContext } from '../utils/requestContext';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const generateRequestId = () => {
  // kısa ama yeterince benzersiz
  return crypto.randomBytes(12).toString('hex');
};

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const incoming = req.headers['x-request-id'];
  const requestId = (typeof incoming === 'string' && incoming.trim()) || generateRequestId();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  return runWithRequestContext({ requestId }, () => next());
};

