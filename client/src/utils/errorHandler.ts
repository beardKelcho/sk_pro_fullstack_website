import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Bir hata oluştu';
    const errors = error.response?.data?.errors;

    return new ApiError(status, message, errors);
  }

  if (error instanceof Error) {
    return new ApiError(500, error.message);
  }

  return new ApiError(500, 'Beklenmeyen bir hata oluştu');
};

export const showError = (error: unknown) => {
  const apiError = handleApiError(error);
  
  if (apiError.errors) {
    Object.values(apiError.errors).forEach(errorMessages => {
      errorMessages.forEach(message => {
        toast.error(message);
      });
    });
  } else {
    toast.error(apiError.message);
  }
};

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showWarning = (message: string) => {
  toast.warning(message);
};

export const showInfo = (message: string) => {
  toast.info(message);
}; 