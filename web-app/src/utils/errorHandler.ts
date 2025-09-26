// Centralized error handling utilities

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
  onRetry?: () => void;
  retryable?: boolean;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly retryable: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status?: number,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
    this.timestamp = new Date();
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', undefined, true);
  }
}

export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 'VALIDATION_ERROR', 400, false);
    this.fields = fields;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401, false);
  }
}

export class LocationError extends AppError {
  constructor(message: string, code: string = 'LOCATION_ERROR') {
    super(message, code, undefined, true);
  }
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: AppError[] = [];
  private maxQueueSize = 50;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle different types of errors
  handle(error: any, options: ErrorHandlerOptions = {}): AppError {
    const appError = this.normalizeError(error);
    
    // Log error if requested
    if (options.logError !== false) {
      this.logError(appError);
    }

    // Add to error queue for debugging
    this.addToQueue(appError);

    // Show toast notification if requested
    if (options.showToast) {
      this.showErrorToast(appError, options);
    }

    return appError;
  }

  // Normalize different error types to AppError
  private normalizeError(error: any): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Network errors
    if (this.isNetworkError(error)) {
      return new NetworkError(error.message || 'Network connection failed');
    }

    // Authentication errors
    if (this.isAuthError(error)) {
      return new AuthenticationError(error.message || 'Authentication required');
    }

    // Validation errors
    if (this.isValidationError(error)) {
      const fields = error.response?.data?.fields || {};
      return new ValidationError(error.message || 'Validation failed', fields);
    }

    // Location errors
    if (this.isLocationError(error)) {
      return new LocationError(error.message || 'Location access failed');
    }

    // Generic API errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message || 'API request failed';
      const retryable = status >= 500 || status === 408 || status === 429;
      
      return new AppError(message, 'API_ERROR', status, retryable);
    }

    // Generic errors
    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      undefined,
      false
    );
  }

  // Check error types
  private isNetworkError(error: any): boolean {
    return (
      !navigator.onLine ||
      error.code === 'NETWORK_ERROR' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('fetch') ||
      error.name === 'NetworkError'
    );
  }

  private isAuthError(error: any): boolean {
    return (
      error.status === 401 ||
      error.response?.status === 401 ||
      error.code === 'UNAUTHORIZED'
    );
  }

  private isValidationError(error: any): boolean {
    return (
      error.status === 400 ||
      error.response?.status === 400 ||
      error.code === 'VALIDATION_ERROR'
    );
  }

  private isLocationError(error: any): boolean {
    return (
      error.code === 1 || // PERMISSION_DENIED
      error.code === 2 || // POSITION_UNAVAILABLE
      error.code === 3 || // TIMEOUT
      error.message?.includes('location') ||
      error.message?.includes('geolocation')
    );
  }

  // Log error to console and external service
  private logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      code: error.code,
      status: error.status,
      retryable: error.retryable,
      timestamp: error.timestamp,
      stack: error.stack
    });

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  // Add error to queue for debugging
  private addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Show error toast (placeholder - implement with your toast library)
  private showErrorToast(error: AppError, options: ErrorHandlerOptions): void {
    const message = options.fallbackMessage || error.message;
    
    // Placeholder for toast notification
    // In a real app, you'd use a toast library like react-hot-toast
    console.log('Toast:', message);
    
    // For now, just show an alert in development
    if (process.env.NODE_ENV === 'development') {
      // Don't show alert for every error to avoid spam
      if (error.code !== 'NETWORK_ERROR') {
        setTimeout(() => alert(`Error: ${message}`), 100);
      }
    }
  }

  // Get recent errors for debugging
  getRecentErrors(): AppError[] {
    return [...this.errorQueue];
  }

  // Clear error queue
  clearErrors(): void {
    this.errorQueue = [];
  }

  // Handle location errors specifically
  handleLocationError(error: GeolocationPositionError): LocationError {
    let message: string;
    let code: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location access denied. Please enable location permissions in your browser settings.';
        code = 'LOCATION_PERMISSION_DENIED';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable. Please check your GPS settings.';
        code = 'LOCATION_UNAVAILABLE';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out. Please try again.';
        code = 'LOCATION_TIMEOUT';
        break;
      default:
        message = 'Failed to get your location. Please try again.';
        code = 'LOCATION_ERROR';
    }

    return new LocationError(message, code);
  }

  // Handle API errors with retry logic
  async handleApiError<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        const appError = this.normalizeError(error);

        // Don't retry if error is not retryable
        if (!appError.retryable || attempt === maxRetries) {
          throw this.handle(appError, { logError: true });
        }

        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw this.handle(lastError, { logError: true });
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export function handleError(error: any, options?: ErrorHandlerOptions): AppError {
  return errorHandler.handle(error, options);
}

export function handleLocationError(error: GeolocationPositionError): LocationError {
  return errorHandler.handleLocationError(error);
}

export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries?: number,
  retryDelay?: number
): Promise<T> {
  return errorHandler.handleApiError(apiCall, maxRetries, retryDelay);
}

// React hook for error handling
export function useErrorHandler() {
  const handleError = (error: any, options?: ErrorHandlerOptions) => {
    return errorHandler.handle(error, options);
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    return errorHandler.handleLocationError(error);
  };

  const withRetry = async <T>(
    apiCall: () => Promise<T>,
    maxRetries?: number,
    retryDelay?: number
  ): Promise<T> => {
    return errorHandler.handleApiError(apiCall, maxRetries, retryDelay);
  };

  return {
    handleError,
    handleLocationError,
    withRetry,
    getRecentErrors: () => errorHandler.getRecentErrors(),
    clearErrors: () => errorHandler.clearErrors()
  };
}