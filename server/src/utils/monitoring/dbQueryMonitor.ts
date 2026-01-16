import mongoose from 'mongoose';
import { recordDbMetric } from './monitoringStore';

let isInitialized = false;

export const initMongooseQueryMonitor = () => {
  if (isInitialized) return;
  isInitialized = true;

  const Query: any = (mongoose as any).Query;
  if (!Query || !Query.prototype || typeof Query.prototype.exec !== 'function') return;

  const originalExec = Query.prototype.exec;

  Query.prototype.exec = async function patchedExec(this: any, ...args: any[]) {
    const start = process.hrtime.bigint();
    try {
      // eslint-disable-next-line prefer-rest-params
      return await originalExec.apply(this, args);
    } finally {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      const model = this?.model?.modelName || 'Unknown';
      const operation = this?.op || 'unknown';
      recordDbMetric({
        ts: Date.now(),
        model,
        operation,
        durationMs,
      });
    }
  };
};

