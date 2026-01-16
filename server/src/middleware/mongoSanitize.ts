import type { NextFunction, Request, Response } from 'express';

type AnyObject = Record<string, any>;

const isPlainObject = (v: any): v is AnyObject => {
  if (!v || typeof v !== 'object') return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

const sanitize = (input: any): any => {
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
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  return next();
};

