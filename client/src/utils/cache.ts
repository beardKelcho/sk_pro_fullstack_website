interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;
  private tagIndex: Map<string, Set<string>>;

  private constructor() {
    this.cache = new Map();
    this.tagIndex = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = 5 * 60 * 1000, tags = [] } = options;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
    };

    this.cache.set(key, item);

    // Tag indeksini güncelle
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)?.add(key);
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL kontrolü
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    const item = this.cache.get(key);
    if (item?.tags) {
      item.tags.forEach(tag => {
        this.tagIndex.get(tag)?.delete(key);
      });
    }
    this.cache.delete(key);
  }

  invalidateByTag(tag: string): void {
    const keys = this.tagIndex.get(tag);
    if (keys) {
      keys.forEach(key => this.delete(key));
      this.tagIndex.delete(tag);
    }
  }

  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
  }
}

export const cache = Cache.getInstance();

// API yanıtları için cache wrapper
export const withCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  const cachedData = cache.get<T>(key);
  if (cachedData) {
    return cachedData;
  }

  const data = await fetchFn();
  cache.set(key, data, options);
  return data;
};

// Cache invalidation için yardımcı fonksiyonlar
export const invalidateCache = {
  byKey: (key: string) => cache.delete(key),
  byTag: (tag: string) => cache.invalidateByTag(tag),
  all: () => cache.clear(),
}; 