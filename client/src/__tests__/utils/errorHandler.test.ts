import { ApiError, handleApiError, showError, showSuccess, showWarning, showInfo } from '../../utils/errorHandler';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ApiError', () => {
    it('should create an ApiError with status and message', () => {
      const error = new ApiError(404, 'Not found');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('ApiError');
    });

    it('should create an ApiError with errors object', () => {
      const errors = {
        email: ['Email is required'],
        password: ['Password is too short'],
      };
      const error = new ApiError(400, 'Validation failed', errors);
      
      expect(error.status).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.errors).toEqual(errors);
    });
  });

  describe('handleApiError', () => {
    it('should return ApiError as-is if already an ApiError', () => {
      const apiError = new ApiError(404, 'Not found');
      const result = handleApiError(apiError);
      
      expect(result).toBe(apiError);
      expect(result.status).toBe(404);
      expect(result.message).toBe('Not found');
    });

    it('should handle AxiosError with response', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            message: 'Bad request',
            errors: {
              email: ['Invalid email'],
            },
          },
        },
      };
      // Make it pass instanceof check
      Object.setPrototypeOf(axiosError, AxiosError.prototype);
      
      const result = handleApiError(axiosError as AxiosError);
      
      expect(result).toBeInstanceOf(ApiError);
      expect(result.status).toBe(400);
      expect(result.message).toBe('Bad request');
      expect(result.errors).toEqual({ email: ['Invalid email'] });
    });

    it('should handle AxiosError without response', () => {
      const axiosError = {
        isAxiosError: true,
        response: undefined,
      };
      Object.setPrototypeOf(axiosError, AxiosError.prototype);
      
      const result = handleApiError(axiosError as AxiosError);
      
      expect(result).toBeInstanceOf(ApiError);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Bir hata oluştu');
    });

    it('should handle AxiosError with response but no message', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {},
        },
      };
      Object.setPrototypeOf(axiosError, AxiosError.prototype);
      
      const result = handleApiError(axiosError as AxiosError);
      
      expect(result).toBeInstanceOf(ApiError);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Bir hata oluştu');
    });

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong');
      const result = handleApiError(error);
      
      expect(result).toBeInstanceOf(ApiError);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle unknown error types', () => {
      const unknownError = 'String error';
      const result = handleApiError(unknownError);
      
      expect(result).toBeInstanceOf(ApiError);
      expect(result.status).toBe(500);
      expect(result.message).toBe('Beklenmeyen bir hata oluştu');
    });

    it('should handle null/undefined', () => {
      const result1 = handleApiError(null);
      const result2 = handleApiError(undefined);
      
      expect(result1).toBeInstanceOf(ApiError);
      expect(result1.status).toBe(500);
      expect(result1.message).toBe('Beklenmeyen bir hata oluştu');
      
      expect(result2).toBeInstanceOf(ApiError);
      expect(result2.status).toBe(500);
      expect(result2.message).toBe('Beklenmeyen bir hata oluştu');
    });
  });

  describe('showError', () => {
    it('should show error toast with message', () => {
      const error = new ApiError(404, 'Not found');
      showError(error);
      
      expect(toast.error).toHaveBeenCalledWith('Not found');
      expect(toast.error).toHaveBeenCalledTimes(1);
    });

    it('should show multiple error toasts for validation errors', () => {
      const error = new ApiError(400, 'Validation failed', {
        email: ['Email is required', 'Email is invalid'],
        password: ['Password is too short'],
      });
      showError(error);
      
      expect(toast.error).toHaveBeenCalledTimes(3);
      expect(toast.error).toHaveBeenCalledWith('Email is required');
      expect(toast.error).toHaveBeenCalledWith('Email is invalid');
      expect(toast.error).toHaveBeenCalledWith('Password is too short');
    });

    it('should handle AxiosError', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: {
            message: 'Server error',
          },
        },
      };
      Object.setPrototypeOf(axiosError, AxiosError.prototype);
      
      showError(axiosError as AxiosError);
      
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });

    it('should handle generic Error', () => {
      const error = new Error('Something went wrong');
      showError(error);
      
      expect(toast.error).toHaveBeenCalledWith('Something went wrong');
    });
  });

  describe('showSuccess', () => {
    it('should show success toast', () => {
      showSuccess('Operation successful');
      
      expect(toast.success).toHaveBeenCalledWith('Operation successful');
      expect(toast.success).toHaveBeenCalledTimes(1);
    });
  });

  describe('showWarning', () => {
    it('should show warning toast', () => {
      showWarning('Warning message');
      
      expect(toast.warning).toHaveBeenCalledWith('Warning message');
      expect(toast.warning).toHaveBeenCalledTimes(1);
    });
  });

  describe('showInfo', () => {
    it('should show info toast', () => {
      showInfo('Info message');
      
      expect(toast.info).toHaveBeenCalledWith('Info message');
      expect(toast.info).toHaveBeenCalledTimes(1);
    });
  });
});
