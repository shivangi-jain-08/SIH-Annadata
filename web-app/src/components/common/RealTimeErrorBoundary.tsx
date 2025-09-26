import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

export class RealTimeErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error details
    console.error('RealTime Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for certain types of errors
    if (this.shouldAutoRetry(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'ConnectionError',
      'WebSocketError'
    ];
    
    return retryableErrors.some(errorType => 
      error.name.includes(errorType) || error.message.includes(errorType)
    );
  }

  private scheduleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState({ isRetrying: true });

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, this.state.retryCount) * 1000;

    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }));
  };

  private handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    });
  };

  private getErrorType(error: Error): string {
    if (error.message.includes('WebSocket') || error.message.includes('Socket')) {
      return 'connection';
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'network';
    }
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return 'timeout';
    }
    return 'unknown';
  }

  private getErrorMessage(error: Error): string {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'connection':
        return 'Real-time connection lost. Trying to reconnect...';
      case 'network':
        return 'Network error occurred. Please check your internet connection.';
      case 'timeout':
        return 'Request timed out. The server might be busy.';
      default:
        return 'An unexpected error occurred in real-time features.';
    }
  }

  private getErrorIcon(error: Error) {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'connection':
        return WifiOff;
      case 'network':
        return Wifi;
      default:
        return AlertTriangle;
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const ErrorIcon = this.getErrorIcon(this.state.error);
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <ErrorIcon className="h-5 w-5" />
              <span>Real-time Feature Error</span>
            </CardTitle>
            <CardDescription className="text-red-700">
              {this.getErrorMessage(this.state.error)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Details */}
            <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-1">
                Error Details:
              </p>
              <p className="text-xs text-red-700 font-mono">
                {this.state.error.message}
              </p>
            </div>

            {/* Retry Information */}
            {this.state.retryCount > 0 && (
              <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Retry attempt {this.state.retryCount} of {this.maxRetries}
                </p>
              </div>
            )}

            {/* Auto-retry Status */}
            {this.state.isRetrying && (
              <div className="flex items-center space-x-2 text-blue-700">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Retrying automatically...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={this.handleManualRetry}
                disabled={this.state.isRetrying}
              >
                {this.state.isRetrying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Try Again
              </Button>
              
              {!canRetry && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-xs text-red-600">
              <p className="mb-1">If this error persists:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Contact support if the issue continues</li>
              </ul>
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="text-xs text-red-600 cursor-pointer">
                  Developer Information (Click to expand)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 border rounded text-xs font-mono overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default RealTimeErrorBoundary;