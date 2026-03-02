import type { NextFunction, Request, Response } from 'express';

type AnyObject = Record<string, any>;

const isPlainObject = (v: unknown): v is AnyObject => {
  if (!v || typeof v !== 'object') return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitize = (input: unknown): unknown => {
  if (Array.isArray(input)) {
    return input.map(sanitize);
  }
  if (isPlainObject(input)) {
    const out: AnyObject = {};
    for (const [key, value] of Object.entries(input)) {
      // NoSQL injection: $operators ve dotted path'leri engelle
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = sanitize(value);
    }
    return out;
  }
  return input;
};

export const mongoSanitize = (req: Request, _res: Response, next: NextFunction) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (req.body) req.body = sanitize(req.body) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (req.query) req.query = sanitize(req.query) as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (req.params) req.params = sanitize(req.params) as any;
  return next();
};

