import { useState, useEffect, useCallback, useRef } from "react";
import { useApiError, ErrorState } from "./useApiError";

interface UseApiOptions {
  immediate?: boolean;
  dependencies?: any[];
  retryCount?: number;
  retryDelay?: number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: ErrorState | null;
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
  retry: (() => void) | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    immediate = true,
    retryCount = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError, retry } = useApiError();
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const apiCallRef = useRef(apiCall);

  // Update the ref when apiCall changes
  useEffect(() => {
    apiCallRef.current = apiCall;
  });

  const execute = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      clearError();

      const result = await apiCallRef.current();

      // Check if component is still mounted and request wasn't aborted
      if (!mountedRef.current || abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(result);
      retryCountRef.current = 0;

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      // Check if component is still mounted and request wasn't aborted
      if (!mountedRef.current || abortControllerRef.current?.signal.aborted) {
        return;
      }

      const error = err instanceof Error ? err : new Error("An error occurred");

      // Handle retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          if (
            mountedRef.current &&
            !abortControllerRef.current?.signal.aborted
          ) {
            execute();
          }
        }, retryDelay * Math.pow(2, retryCountRef.current - 1)); // Exponential backoff
        return;
      }

      handleError(error, () => {
        retryCountRef.current = 0;
        execute();
      });

      if (onError) {
        onError(error);
      }
    } finally {
      if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    enabled,
    retryCount,
    retryDelay,
    handleError,
    clearError,
    onSuccess,
    onError,
  ]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setData(null);
    clearError();
    setLoading(false);
    retryCountRef.current = 0;
  }, [clearError]);

  // Effect that runs when dependencies change
  useEffect(() => {
    if (immediate && enabled) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, enabled, ...dependencies]);

  // Cleanup effect
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
    retry,
  };
}

// Specialized hook for mutations (POST, PUT, DELETE operations)
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: Omit<UseApiOptions, "immediate" | "dependencies"> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const mutate = useCallback(
    async (params: P) => {
      try {
        setLoading(true);
        clearError();

        const result = await mutationFn(params);
        setData(result);

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An error occurred");
        handleError(error);

        if (options.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, handleError, clearError, options]
  );

  const reset = useCallback(() => {
    setData(null);
    clearError();
    setLoading(false);
  }, [clearError]);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}
