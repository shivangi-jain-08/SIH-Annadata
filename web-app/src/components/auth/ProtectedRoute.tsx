import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'farmer' | 'vendor' | 'consumer';
  fallbackPath?: string;
}

// Loading component
const AuthLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Verifying authentication...</p>
    </div>
  </div>
);

// Error component
const AuthErrorCard = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">Authentication Error</CardTitle>
        <CardDescription>{error}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {onRetry && (
          <Button onClick={onRetry} className="w-full" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
        <Button asChild className="w-full">
          <a href="/login">Go to Login</a>
        </Button>
      </CardContent>
    </Card>
  </div>
);

// Role mismatch component
const RoleMismatchCard = ({ userRole, requiredRole }: { userRole: string; requiredRole: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Shield className="h-6 w-6 text-yellow-600" />
        </div>
        <CardTitle className="text-yellow-900">Access Restricted</CardTitle>
        <CardDescription>
          This page requires {requiredRole} access, but you are logged in as a {userRole}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <a href={`/dashboard/${userRole}`}>Go to My Dashboard</a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <a href="/logout">Switch Account</a>
        </Button>
      </CardContent>
    </Card>
  </div>
);

export function ProtectedRoute({ children, requiredRole, fallbackPath }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading, error, clearError } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being verified
  if (loading) {
    return <AuthLoadingSpinner />;
  }

  // Show error if authentication failed
  if (error) {
    return <AuthErrorCard error={error} onRetry={clearError} />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    // If a fallback path is provided, redirect there
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    // Show role mismatch card instead of immediate redirect
    return <RoleMismatchCard userRole={user.role} requiredRole={requiredRole} />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}