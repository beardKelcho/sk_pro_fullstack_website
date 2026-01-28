/**
 * Ortak Type Tanımlamaları
 * Type safety için merkezi type tanımlamaları
 */

import { Request, Response } from 'express';
import { IUser } from '../models/User';
import { IProject } from '../models/Project';
import { IEquipment } from '../models/Equipment';
import { IClient } from '../models/Client';

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
  user?: IUser;
}

/**
 * Express Response Extension
 */
export type ApiResponseType = Response<ApiResponse>;

/**
 * Error Type (catch blokları için)
 */
export class AppError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
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

/**
 * Mongoose Populated Field Type
 * T: The base document type
 * K: The keys that are populated
 * P: The type of the populated document (defaults to any if not specified, but should be specific)
 */
export type Populated<T, K extends keyof T, P> = Omit<T, K> & {
  [Key in K]: P;
};

// Also import interfaces to create concrete populated types
// Imports moved to top

export interface IProjectPopulated extends Omit<IProject, 'client' | 'team' | 'equipment'> {
  client: IClient;
  team: IUser[];
  equipment: IEquipment[];
}

export interface IEquipmentPopulated extends Omit<IEquipment, 'responsibleUser' | 'currentProject'> {
  responsibleUser?: IUser; // Optional because it might not be populated or null
  currentProject?: IProject;
}
