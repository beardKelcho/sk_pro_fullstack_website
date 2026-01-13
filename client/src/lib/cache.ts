import { cache } from 'react';

interface CacheOptions {
  revalidate?: number;
  tags?: string[];
}

export const getCachedData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  const { revalidate = 3600, tags = [] } = options;

  try {
    const response = await fetchFn();
    return response;
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error);
    throw error;
  }
});

export const revalidateCache = async (tag: string) => {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag }),
    });
  } catch (error) {
    console.error(`Revalidation error for tag ${tag}:`, error);
  }
}; 