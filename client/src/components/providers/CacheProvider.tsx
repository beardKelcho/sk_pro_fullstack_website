import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { cache } from '@/utils/cache';

interface CacheContextType {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, data: T, options?: { ttl?: number; tags?: string[] }) => Promise<void>;
  remove: (key: string) => Promise<void>;
  checkStatus: (key: string) => Promise<{
    exists: boolean;
    ttl: number;
    size: number;
  }>;
  getStats: () => Promise<{
    totalKeys: number;
    totalSize: number;
    tags: string[];
  }>;
}

const CacheContext = createContext<CacheContextType | null>(null);

interface CacheProviderProps {
  children: React.ReactNode;
  defaultTTL?: number;
  defaultTags?: string[];
}

export function CacheProvider({ children, defaultTTL = 3600, defaultTags = [] }: CacheProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Cache provider'ı başlat
    setIsInitialized(true);
  }, []);

  const value: CacheContextType = {
    get: async <T,>(key: string) => {
      try {
        return cache.get<T>(key);
      } catch (error) {
        console.error('Cache get error:', error);
        return null;
      }
    },

    set: async <T,>(key: string, data: T, options: { ttl?: number; tags?: string[] } = {}) => {
      try {
        cache.set(key, data, {
          ttl: options.ttl || defaultTTL,
          tags: options.tags || defaultTags,
        });
      } catch (error) {
        console.error('Cache set error:', error);
      }
    },

    remove: async (key: string) => {
      try {
        cache.delete(key);
      } catch (error) {
        console.error('Cache remove error:', error);
      }
    },

    checkStatus: async (key: string) => {
      try {
        const item = (cache as any).cache.get(key);
        if (!item) {
          return { exists: false, ttl: 0, size: 0 };
        }
        const ttl = (item.ttl || defaultTTL) - (Date.now() - item.timestamp);
        return {
          exists: true,
          ttl: Math.max(0, ttl),
          size: JSON.stringify(item.data).length,
        };
      } catch (error) {
        console.error('Cache check status error:', error);
        return {
          exists: false,
          ttl: 0,
          size: 0,
        };
      }
    },

    getStats: async () => {
      try {
        const cacheInstance = (cache as any);
        const totalKeys = cacheInstance.cache.size;
        const tags = Array.from(cacheInstance.tagIndex.keys()) as string[];
        let totalSize = 0;
        cacheInstance.cache.forEach((item: any) => {
          totalSize += JSON.stringify(item.data).length;
        });
        return {
          totalKeys: Number(totalKeys),
          totalSize,
          tags,
        };
      } catch (error) {
        console.error('Cache get stats error:', error);
        return {
          totalKeys: 0,
          totalSize: 0,
          tags: [],
        };
      }
    },
  };

  if (!isInitialized) {
    return null;
  }

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}

// Cache hook'u
export function useCacheData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number;
    tags?: string[];
    enabled?: boolean;
  } = {}
) {
  const { ttl, tags, enabled = true } = options;
  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchDataRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Cache'den veriyi al
        const cachedData = await cache.get<T>(key);
        if (cachedData) {
          if (isMounted) {
            setData(cachedData);
          }
          return;
        }

        // Cache'de yoksa, veriyi getir
        const freshData = await fetchFn();
        if (isMounted) {
          setData(freshData);
        }

        // Cache'e kaydet
        await cache.set(key, freshData, { ttl, tags });
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('An error occurred'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDataRef.current = fetchData;

    if (enabled) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [key, enabled, ttl, tags, fetchFn, cache]);

  return {
    data,
    isLoading,
    error,
    refetch: async () => {
      await cache.remove(key);
      if (fetchDataRef.current) {
        await fetchDataRef.current();
      }
    },
  };
} 