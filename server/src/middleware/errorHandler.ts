import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors: err.errors,
    });
  }

  // MongoDB duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    return res.status(409).json({
      status: 'fail',
      message: 'Duplicate field value entered',
    });
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation error',
      errors: Object.values((err as any).errors).map((el: any) => el.message),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again!',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Your token has expired! Please log in again.',
    });
  }

  // Default error
  logger.error('Unhandled error:', {
    error: err,
    message: err.message,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method,
  });
  
  // Response henüz gönderilmediyse gönder
  if (!res.headersSent) {
    const isTestOrDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
    return res.status(500).json({
      success: false,
      status: 'error',
      message: isTestOrDev 
        ? (err.message || 'Internal Server Error')
        : 'Internal Server Error',
      ...(isTestOrDev ? { 
        details: err.stack,
        name: err.name,
        path: req.path,
        method: req.method
      } : {}),
    });
  } else {
    logger.warn('Error handler called but response already sent', { path: req.path });
  }
}; 