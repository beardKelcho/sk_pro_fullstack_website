import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getUserFriendlyMessage, handleApiError } from '@/utils/apiErrorHandler';

export const useApiError = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: unknown) => {
    const errorMessage = getUserFriendlyMessage(handleApiError(err));
    setError(errorMessage);
    toast.error(errorMessage);
    return errorMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};
