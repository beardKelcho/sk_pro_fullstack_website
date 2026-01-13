/**
 * Image URL Utility Testleri
 */

import { getImageUrl, getBaseUrl } from '@/utils/imageUrl';

describe('Image URL Utility Testleri', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getBaseUrl', () => {
    it('NEXT_PUBLIC_API_URL varsa onu kullanmalı', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001/api';
      expect(getBaseUrl()).toBe('http://localhost:5001');
    });

    it('NEXT_PUBLIC_API_URL yoksa default kullanmalı', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      expect(getBaseUrl()).toBe('http://localhost:5001');
    });
  });

  describe('getImageUrl', () => {
    it('imageId ile URL oluşturmalı', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001/api';
      const url = getImageUrl({ imageId: '123' });
      expect(url).toBe('http://localhost:5001/api/site-images/public/123/image');
    });

    it('image object ile _id kullanmalı', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001/api';
      const url = getImageUrl({
        image: { _id: '123', filename: 'test.jpg' },
      });
      expect(url).toBe('http://localhost:5001/api/site-images/public/123/image');
    });

    it('image object ile url kullanmalı', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001/api';
      const url = getImageUrl({
        image: { url: 'http://example.com/image.jpg' },
      });
      expect(url).toBe('http://example.com/image.jpg');
    });

    it('relative path ile URL oluşturmalı', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001/api';
      const url = getImageUrl({
        image: { path: '/uploads/test.jpg' },
      });
      expect(url).toBe('http://localhost:5001/uploads/test.jpg');
    });

    it('fallback kullanmalı', () => {
      const url = getImageUrl({ fallback: '/default.jpg' });
      expect(url).toBe('/default.jpg');
    });
  });
});

