/**
 * Query Optimization Utilities
 * Database sorgularını optimize etmek için yardımcı fonksiyonlar
 */

import mongoose from 'mongoose';
import logger from './logger';

/**
 * Query explain plan analizi
 * Sorgunun performansını analiz eder
 */
export const explainQuery = async <T>(
  query: mongoose.Query<T, T>,
  label?: string
): Promise<unknown> => {
  try {
    const explainResult = await query.explain('executionStats') as unknown;

    const resultObj = explainResult as Record<string, unknown>;
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_QUERIES === 'true') {
      logger.debug(`Query Explain (${label || 'unnamed'}):`, {
        executionStats: resultObj?.executionStats,
        queryPlanner: resultObj?.queryPlanner,
      });
    }

    return explainResult;
  } catch (error) {
    logger.error('Query explain error:', error);
    return null;
  }
};

/**
 * Index kullanımını kontrol et
 */
export const checkIndexUsage = async (
  collectionName: string, query: unknown): Promise<boolean> => {
  try {
    if (!mongoose.connection.db) {
      return false;
    }

    const explainResult = await mongoose.connection.db
      .collection(collectionName)
      .find(query as Record<string, unknown>)
      .explain('executionStats') as unknown;

    const resultObj = explainResult as Record<string, unknown>;
    const executionStats = (resultObj?.executionStats as Record<string, unknown>) || ((resultObj?.queryPlanner as Record<string, unknown>)?.winningPlan as Record<string, unknown>);
    const stage = executionStats?.stage || (executionStats?.inputStage as Record<string, unknown>)?.stage;

    // Index kullanıldı mı?
    const usesIndex = stage === 'IXSCAN' || stage === 'FETCH' || ((executionStats?.totalDocsExamined as number) < (executionStats?.totalDocsReturned as number));

    if (!usesIndex && process.env.NODE_ENV === 'development') {
      logger.warn(`⚠️  Query on ${collectionName} may not be using an index:`, {
        query,
        stage,
        executionStats,
      });
    }

    return usesIndex;
  } catch (error) {
    logger.error('Index usage check error:', error);
    return false;
  }
};

/**
 * Select only needed fields (projection)
 */
export const selectFields = <T>(
  fields: (keyof T)[]
): Record<string, 1> => {
  return fields.reduce((acc, field) => {
    acc[field as string] = 1;
    return acc;
  }, {} as Record<string, 1>);
};

/**
 * Pagination helper with optimized skip/limit
 */
export const paginate = (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

/**
 * Sort helper with index-friendly sorting
 */
export const sortBy = (field: string, order: 'asc' | 'desc' = 'asc') => {
  return { [field]: order === 'asc' ? 1 : -1 };
};

/**
 * Lean query helper (faster, returns plain objects)
 */
export const leanQuery = <T, U = unknown>(query: mongoose.Query<T, T>): mongoose.Query<U, U> => {
  return query.lean() as unknown as mongoose.Query<U, U>;
};

/**
 * Batch processing helper
 * Büyük veri setlerini küçük parçalara bölerek işler
 */
export const batchProcess = async <T>(
  query: mongoose.Query<T[], T>,
  batchSize: number,
  processor: (batch: unknown[]) => Promise<void>
): Promise<void> => {
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await (query.skip(skip).limit(batchSize).lean().exec() as Promise<unknown[]>);

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    await processor(batch);
    skip += batchSize;

    if (batch.length < batchSize) {
      hasMore = false;
    }
  }
};

/**
 * Query cache helper (basit in-memory cache)
 */
const queryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

export const cachedQuery = async <T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> => {
  const cached = queryCache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const data = await queryFn();
  queryCache.set(key, { data, timestamp: Date.now() });

  return data;
};

/**
 * Cache temizleme
 */
export const clearQueryCache = (pattern?: string): void => {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of queryCache.keys()) {
      if (regex.test(key)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
};

/**
 * Slow query detection
 */
export const detectSlowQueries = (threshold: number = 1000) => {
  const originalExec = mongoose.Query.prototype.exec;

  mongoose.Query.prototype.exec = function (this: unknown, ...args: unknown[]) {
    const startTime = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const query = this;

    // Mongoose exec method signature override
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (originalExec.apply(this, args as any) as Promise<any>).then((result: any) => {
      const duration = Date.now() - startTime;

      if (duration > threshold) {
        logger.warn(`⚠️  Slow query detected (${duration}ms):`, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          model: (query as any).model?.modelName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          op: (query as any).op,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          conditions: (query as any)._conditions,
          duration,
        });
      }

      return result;
    });
  };
};
