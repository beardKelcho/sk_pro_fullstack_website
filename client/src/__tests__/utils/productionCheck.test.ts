/**
 * Production Check Utility Testleri
 */

import { productionChecker } from '@/utils/productionCheck';

describe('Production Check Utility Testleri', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('runChecks', () => {
    it('tüm kontrolleri çalıştırmalı', () => {
      const results = productionChecker.runChecks();

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Environment Variables Check', () => {
    it('eksik environment variables varsa fail döndürmeli', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      const results = productionChecker.runChecks();
      const envCheck = results.find(r => r.name === 'Environment Variables');

      expect(envCheck?.status).toBe('fail');
      expect(envCheck?.message).toContain('Eksik environment variables');
    });

    it('tüm environment variables varsa pass döndürmeli', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://skproduction.com';
      process.env.NEXT_PUBLIC_API_URL = 'https://api.skproduction.com';

      const results = productionChecker.runChecks();
      const envCheck = results.find(r => r.name === 'Environment Variables');

      expect(envCheck?.status).toBe('pass');
    });
  });

  describe('API URL Check', () => {
    it('API URL yoksa fail döndürmeli', () => {
      delete process.env.NEXT_PUBLIC_API_URL;

      const results = productionChecker.runChecks();
      const apiCheck = results.find(r => r.name === 'API URL');

      expect(apiCheck?.status).toBe('fail');
    });

    it('localhost API URL varsa warning döndürmeli', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5001';

      const results = productionChecker.runChecks();
      const apiCheck = results.find(r => r.name === 'API URL');

      expect(apiCheck?.status).toBe('warning');
      expect(apiCheck?.message).toContain('localhost');
    });

    it('production API URL varsa pass döndürmeli', () => {
      process.env.NEXT_PUBLIC_API_URL = 'https://api.skproduction.com';

      const results = productionChecker.runChecks();
      const apiCheck = results.find(r => r.name === 'API URL');

      expect(apiCheck?.status).toBe('pass');
    });
  });

  describe('formatResults', () => {
    it('sonuçları formatlamalı', () => {
      const results = [
        { name: 'Test 1', status: 'pass' as const, message: 'Passed', required: true },
        { name: 'Test 2', status: 'fail' as const, message: 'Failed', required: true },
        { name: 'Test 3', status: 'warning' as const, message: 'Warning', required: false },
      ];

      const formatted = productionChecker.formatResults(results);

      expect(formatted).toContain('Test 1');
      expect(formatted).toContain('Test 2');
      expect(formatted).toContain('Test 3');
      expect(formatted).toContain('Passed: 1');
      expect(formatted).toContain('Failed: 1');
      expect(formatted).toContain('Warnings: 1');
    });
  });
});

