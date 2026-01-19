import { cache, withCache, invalidateCache } from '../../utils/cache';

describe('cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('Cache instance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = cache;
      const instance2 = cache;
      expect(instance1).toBe(instance2);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should store and retrieve objects', () => {
      const data = { name: 'Test', count: 42 };
      cache.set('key2', data);
      expect(cache.get('key2')).toEqual(data);
    });

    it('should store and retrieve arrays', () => {
      const data = [1, 2, 3, 4, 5];
      cache.set('key3', data);
      expect(cache.get('key3')).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should use default TTL of 5 minutes', () => {
      const originalDateNow = Date.now;
      let currentTime = 1000000;
      Date.now = jest.fn(() => currentTime);

      cache.set('key4', 'value4');
      expect(cache.get('key4')).toBe('value4');

      // Advance time by 4 minutes (still valid)
      currentTime += 4 * 60 * 1000;
      expect(cache.get('key4')).toBe('value4');

      // Advance time by 2 more minutes (expired)
      currentTime += 2 * 60 * 1000;
      expect(cache.get('key4')).toBeNull();

      Date.now = originalDateNow;
    });

    it('should respect custom TTL', () => {
      const originalDateNow = Date.now;
      let currentTime = 1000000;
      Date.now = jest.fn(() => currentTime);

      cache.set('key5', 'value5', { ttl: 1000 }); // 1 second
      expect(cache.get('key5')).toBe('value5');

      // Advance time by 500ms (still valid)
      currentTime += 500;
      expect(cache.get('key5')).toBe('value5');

      // Advance time by 600ms more (expired)
      currentTime += 600;
      expect(cache.get('key5')).toBeNull();

      Date.now = originalDateNow;
    });
  });

  describe('delete', () => {
    it('should delete a key', () => {
      cache.set('key6', 'value6');
      expect(cache.get('key6')).toBe('value6');
      
      cache.delete('key6');
      expect(cache.get('key6')).toBeNull();
    });

    it('should handle deleting non-existent keys', () => {
      expect(() => cache.delete('non-existent')).not.toThrow();
    });
  });

  describe('tags', () => {
    it('should store items with tags', () => {
      cache.set('key7', 'value7', { tags: ['tag1', 'tag2'] });
      expect(cache.get('key7')).toBe('value7');
    });

    it('should invalidate all items with a specific tag', () => {
      cache.set('key8', 'value8', { tags: ['projects'] });
      cache.set('key9', 'value9', { tags: ['projects'] });
      cache.set('key10', 'value10', { tags: ['users'] });
      
      expect(cache.get('key8')).toBe('value8');
      expect(cache.get('key9')).toBe('value9');
      expect(cache.get('key10')).toBe('value10');
      
      invalidateCache.byTag('projects');
      
      expect(cache.get('key8')).toBeNull();
      expect(cache.get('key9')).toBeNull();
      expect(cache.get('key10')).toBe('value10'); // Should still exist
    });

    it('should handle multiple tags per item', () => {
      cache.set('key11', 'value11', { tags: ['tag1', 'tag2'] });
      cache.set('key12', 'value12', { tags: ['tag2', 'tag3'] });
      
      invalidateCache.byTag('tag2');
      
      expect(cache.get('key11')).toBeNull();
      expect(cache.get('key12')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all cache', () => {
      cache.set('key13', 'value13');
      cache.set('key14', 'value14', { tags: ['tag1'] });
      
      expect(cache.get('key13')).toBe('value13');
      expect(cache.get('key14')).toBe('value14');
      
      cache.clear();
      
      expect(cache.get('key13')).toBeNull();
      expect(cache.get('key14')).toBeNull();
    });
  });

  describe('withCache', () => {
    it('should return cached data if available', async () => {
      cache.set('cache-key', 'cached-value');
      
      const fetchFn = jest.fn().mockResolvedValue('new-value');
      const result = await withCache('cache-key', fetchFn);
      
      expect(result).toBe('cached-value');
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not available', async () => {
      const fetchFn = jest.fn().mockResolvedValue('fetched-value');
      const result = await withCache('cache-key-2', fetchFn);
      
      expect(result).toBe('fetched-value');
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(cache.get('cache-key-2')).toBe('fetched-value');
    });

    it('should pass cache options to cache.set', async () => {
      const originalDateNow = Date.now;
      let currentTime = 1000000;
      Date.now = jest.fn(() => currentTime);

      const fetchFn = jest.fn().mockResolvedValue('value');
      await withCache('cache-key-3', fetchFn, { ttl: 2000, tags: ['test'] });
      
      expect(cache.get('cache-key-3')).toBe('value');
      
      // Advance time beyond TTL
      currentTime += 3000;
      expect(cache.get('cache-key-3')).toBeNull();
      
      Date.now = originalDateNow;
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate by key', () => {
      cache.set('key15', 'value15');
      expect(cache.get('key15')).toBe('value15');
      
      invalidateCache.byKey('key15');
      expect(cache.get('key15')).toBeNull();
    });

    it('should invalidate by tag', () => {
      cache.set('key16', 'value16', { tags: ['tag1'] });
      cache.set('key17', 'value17', { tags: ['tag2'] });
      
      invalidateCache.byTag('tag1');
      
      expect(cache.get('key16')).toBeNull();
      expect(cache.get('key17')).toBe('value17');
    });

    it('should invalidate all', () => {
      cache.set('key18', 'value18');
      cache.set('key19', 'value19', { tags: ['tag1'] });
      
      invalidateCache.all();
      
      expect(cache.get('key18')).toBeNull();
      expect(cache.get('key19')).toBeNull();
    });
  });
});
