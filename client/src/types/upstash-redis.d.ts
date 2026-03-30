declare module '@upstash/redis' {
  export class Redis {
    constructor(config: { url: string; token: string });
    get(key: string): Promise<unknown>;
    set(key: string, value: string, options?: { ex?: number }): Promise<unknown>;
    incr(key: string): Promise<number>;
    expire(key: string, ttl: number): Promise<unknown>;
    ttl(key: string): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    del(...keys: string[]): Promise<unknown>;
  }
}
