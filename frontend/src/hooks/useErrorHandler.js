// frontend/src/hooks/useErrorHandler.js
// Custom hook for error handling

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, customMessage = null) => {
    console.error('Error:', error);
    
    let errorMessage = customMessage;
    
    if (!errorMessage) {
      if (error.response) {
        // API error
        errorMessage = error.response.data?.message || error.response.data?.error || 'API request failed';
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message) {
        // General error
        errorMessage = error.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
    }

    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async (asyncFunction, customMessage = null) => {
    setIsLoading(true);
    clearError();

    try {
      const result = await asyncFunction();
      return result;
    } catch (error) {
      handleError(error, customMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  };
};

export default useErrorHandler;
