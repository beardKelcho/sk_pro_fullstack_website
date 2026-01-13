import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ApiError {
  message: string;
  isNetworkError?: boolean;
}

export const useApiError = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any) => {
    let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    
    if (err.isNetworkError || !err.response) {
      errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
    
    return errorMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

