import { AsyncLocalStorage } from 'node:async_hooks';

type RequestContextStore = {
  requestId?: string;
};

const als = new AsyncLocalStorage<RequestContextStore>();

export const runWithRequestContext = <T>(store: RequestContextStore, fn: () => T): T => {
  return als.run(store, fn);
};

export const getRequestId = (): string | undefined => {
  return als.getStore()?.requestId;
};

