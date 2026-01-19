/**
 * Ortak Type Tanımlamaları
 * Type safety için merkezi type tanımlamaları
 */

import { Request, Response } from 'express';

/**
 * API Error Response Tipi
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * API Success Response Tipi
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * API Response Union Tipi
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Express Request Extension (user bilgisi için)
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id?: string;
    email: string;
    role: string;
    name?: string;
  };
}

/**
 * Express Response Extension
 */
export type ApiResponseType = Response<ApiResponse>;

/**
 * Error Type (catch blokları için)
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Mongoose Error Type
 */
export interface MongooseError extends Error {
  code?: number | string;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string; path: string; value: unknown }>;
}

/**
 * Axios Error Type
 */
export interface AxiosError extends Error {
  response?: {
    status: number;
    statusText: string;
    data?: unknown;
  };
  request?: unknown;
  config?: unknown;
  code?: string;
}

/**
 * Generic Object Type (any yerine)
 */
export type GenericObject = Record<string, unknown>;

/**
 * Unknown Object Type (daha güvenli)
 */
export type UnknownObject = Record<string, unknown> | unknown[] | null | undefined;

/**
 * Mongoose Filter Type (generic)
 */
export type MongooseFilter<T> = import('mongoose').FilterQuery<T>;

/**
 * Mongoose Sort Options Type
 */
export type MongooseSortOptions = Record<string, import('mongoose').SortOrder>;

/**
 * Mongoose Update Result Type
 */
export interface MongooseUpdateResult {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId?: unknown;
  upsertedCount?: number;
  matchedCount: number;
}
