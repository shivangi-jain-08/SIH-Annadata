import { useState, useCallback } from 'react';
import { ApiError, NetworkError } from '@/services/api';

export interface ErrorState {
  message: string;
  code?: string;
  status?: number;
  isNetworkError: boolean;
  canRetry: boolean;
}

export interface UseApiErrorReturn {
  error: ErrorState | null;
  setError: (error: Error | null) => void;
  clearError: () => void;
  handleError: (error: Error, retryFn?: () => void) => void;
  retry: (() => void) | null;
}

export function useApiError(): UseApiErrorReturn {
  const [error, setErrorState] = useState<ErrorState | null>(null);
  const [retryFn, setRetryFn] = useState<(() => void) | null>(null);

  const setError = useCallback((error: Error | null) => {
    if (!error) {
      setErrorState(null);
      setRetryFn(null);
      return;
    }

    let errorState: ErrorState;

    if (error instanceof ApiError) {
      errorState = {
        message: error.message,
        code: error.code,
        status: error.status,
        isNetworkError: false,
        canRetry: error.status ? error.status >= 500 || error.status === 408 || error.status === 429 : false,
      };
    } else if (error instanceof NetworkError) {
      errorState = {
        message: error.message,
        isNetworkError: true,
        canRetry: true,
      };
    } else {
      errorState = {
        message: error.message || 'An unexpected error occurred',
        isNetworkError: false,
        canRetry: false,
      };
    }

    setErrorState(errorState);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
    setRetryFn(null);
  }, []);

  const handleError = useCallback((error: Error, retryFunction?: () => void) => {
    setError(error);
    if (retryFunction) {
      setRetryFn(() => retryFunction);
    }
  }, [setError]);

  const retry = useCallback(() => {
    if (retryFn) {
      clearError();
      retryFn();
    }
  }, [retryFn, clearError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    retry: retryFn ? retry : null,
  };
}

// Helper function to get user-friendly error messages
export function getErrorMessage(error: Error): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return 'Please log in to continue';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action';
      case 'NOT_FOUND':
        return 'The requested resource was not found';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again';
      default:
        return error.message;
    }
  }

  if (error instanceof NetworkError) {
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again';
    }
    return 'Network error. Please check your connection and try again';
  }

  return error.message || 'An unexpected error occurred';
}

// Helper function to determine if an error should show a retry button
export function canRetryError(error: Error): boolean {
  if (error instanceof ApiError) {
    return error.status ? error.status >= 500 || error.status === 408 || error.status === 429 : false;
  }

  if (error instanceof NetworkError) {
    return true;
  }

  return false;
}