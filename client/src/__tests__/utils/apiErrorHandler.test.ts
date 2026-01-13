/**
 * API Error Handler Utility Tests
 */

import { AxiosError } from 'axios';
import { handleApiError, getUserFriendlyMessage, ApiError } from '@/utils/apiErrorHandler';

describe('API Error Handler', () => {
  describe('handleApiError', () => {
    it('should handle network error', () => {
      const networkError = new AxiosError('Network Error');
      networkError.isAxiosError = true;
      networkError.config = { url: '/api/test' } as any;

      const result = handleApiError(networkError);

      expect(result.isNetworkError).toBe(true);
      expect(result.message).toContain('bağlanılamıyor');
    });

    it('should handle 401 unauthorized error', () => {
      const axiosError = new AxiosError('Unauthorized');
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 401,
        data: { message: 'Unauthorized' },
      } as any;
      axiosError.config = { url: '/api/test' } as any;

      const result = handleApiError(axiosError);

      expect(result.isAuthError).toBe(true);
      expect(result.status).toBe(401);
      expect(result.message).toBe('Unauthorized');
    });

    it('should handle 403 forbidden error', () => {
      const axiosError = new AxiosError('Forbidden');
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 403,
        data: { message: 'Forbidden' },
      } as any;
      axiosError.config = { url: '/api/test' } as any;

      const result = handleApiError(axiosError);

      expect(result.isAuthError).toBe(true);
      expect(result.status).toBe(403);
    });

    it('should handle 500 server error', () => {
      const axiosError = new AxiosError('Internal Server Error');
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 500,
        data: { message: 'Internal Server Error' },
      } as any;
      axiosError.config = { url: '/api/test' } as any;

      const result = handleApiError(axiosError);

      expect(result.status).toBe(500);
      expect(result.message).toBe('Internal Server Error');
    });

    it('should handle error with error field in response', () => {
      const axiosError = new AxiosError('Error');
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 400,
        data: { error: 'Bad Request' },
      } as any;
      axiosError.config = { url: '/api/test' } as any;

      const result = handleApiError(axiosError);

      expect(result.message).toBe('Bad Request');
    });

    it('should handle general Error', () => {
      const error = new Error('Something went wrong');

      const result = handleApiError(error);

      expect(result.message).toBe('Something went wrong');
      expect(result.originalError).toBe(error);
    });

    it('should handle unknown error type', () => {
      const unknownError = 'String error';

      const result = handleApiError(unknownError);

      expect(result.message).toBe('Beklenmeyen bir hata oluştu');
      expect(result.originalError).toBe(unknownError);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return network error message', () => {
      const error: ApiError = {
        message: 'Network error',
        isNetworkError: true,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toContain('bağlanılamıyor');
    });

    it('should return 401 error message', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        status: 401,
        isAuthError: true,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toContain('oturumunuz sona ermiş');
    });

    it('should return 403 error message', () => {
      const error: ApiError = {
        message: 'Forbidden',
        status: 403,
        isAuthError: true,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toContain('yetkiniz bulunmamaktadır');
    });

    it('should return 400 error message', () => {
      const error: ApiError = {
        message: 'Invalid request',
        status: 400,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Invalid request');
    });

    it('should return 404 error message', () => {
      const error: ApiError = {
        message: 'Not found',
        status: 404,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toBe('İstenen kaynak bulunamadı.');
    });

    it('should return 409 error message', () => {
      const error: ApiError = {
        message: 'Conflict',
        status: 409,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toContain('çakışma');
    });

    it('should return 422 error message', () => {
      const error: ApiError = {
        message: 'Validation error',
        status: 422,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Validation error');
    });

    it('should return 429 error message', () => {
      const error: ApiError = {
        message: 'Too many requests',
        status: 429,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toContain('çok fazla istek');
    });

    it('should return 500 error message', () => {
      const error: ApiError = {
        message: 'Server error',
        status: 500,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toContain('Sunucu hatası');
    });

    it('should return 503 error message', () => {
      const error: ApiError = {
        message: 'Service unavailable',
        status: 503,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toContain('kullanılamıyor');
    });

    it('should return default error message', () => {
      const error: ApiError = {
        message: 'Unknown error',
        status: 999,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Unknown error');
    });

    it('should return default message when no message provided', () => {
      const error: ApiError = {
        status: 999,
      };

      const message = getUserFriendlyMessage(error);

      expect(message).toBe('Bir hata oluştu. Lütfen tekrar deneyin.');
    });
  });
});

