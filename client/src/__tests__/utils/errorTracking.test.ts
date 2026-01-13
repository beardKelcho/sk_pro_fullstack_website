/**
 * Error Tracking Utility Testleri
 */

import { errorTracker } from '@/utils/errorTracking';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Error Tracking Utility Testleri', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('logError', () => {
    it('string hata loglamalı', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorTracker.logError('Test error');

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('Error objesi loglamalı', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      errorTracker.logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('context ile hata loglamalı', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorTracker.logError('Test error', { userId: '123', action: 'test' });

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('severity ile hata loglamalı', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorTracker.logError('Critical error', undefined, 'critical');

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('captureException', () => {
    it('React Error Boundary hatası yakalamalı', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Component error');
      const errorInfo = {
        componentStack: 'Component stack trace',
      };

      errorTracker.captureException(error, errorInfo);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('captureUnhandledRejection', () => {
    it('unhandled promise rejection yakalamalı', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorTracker.captureUnhandledRejection(new Error('Promise rejected'));

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('string rejection yakalamalı', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorTracker.captureUnhandledRejection('String rejection');

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearLogs', () => {
    it('hata loglarını temizlemeli', () => {
      localStorage.setItem('errorLogs', JSON.stringify([{ message: 'test' }]));

      errorTracker.clearLogs();

      expect(localStorage.getItem('errorLogs')).toBeNull();
    });
  });

  describe('getLogs', () => {
    it('hata loglarını getirmeli', () => {
      const logs = [{ message: 'test', timestamp: '2026-01-08T10:00:00Z' }];
      localStorage.setItem('errorLogs', JSON.stringify(logs));

      const result = errorTracker.getLogs();

      expect(result).toEqual(logs);
    });

    it('log yoksa boş array döndürmeli', () => {
      const result = errorTracker.getLogs();

      expect(result).toEqual([]);
    });

    it('geçersiz JSON durumunda boş array döndürmeli', () => {
      localStorage.setItem('errorLogs', 'invalid json');

      const result = errorTracker.getLogs();

      expect(result).toEqual([]);
    });
  });
});

