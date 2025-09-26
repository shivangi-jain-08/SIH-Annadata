import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { User, RegisterData, LoginData } from '@/types/api';
import ApiClient from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  mockLogin: (role: string) => Promise<void>;
}

// Token management utilities
class TokenManager {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly USER_KEY = 'user';
  private static readonly TOKEN_EXPIRY_KEY = 'tokenExpiry';

  static setTokens(token: string, refreshToken?: string, expiresIn?: number) {
    localStorage.setItem(this.TOKEN_KEY, token);
    
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) return false;
    
    return Date.now() > parseInt(expiryTime);
  }

  static getTokenExpiryTime(): number | null {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    return expiryTime ? parseInt(expiryTime) : null;
  }

  static setUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  static clearAll() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  const refreshTimeoutRef = useRef<number | null>(null);
  const isRefreshingRef = useRef(false);

  // Logout function (defined first to avoid dependency issues)
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      // Call backend logout endpoint
      try {
        await ApiClient.logout();
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with local logout even if API call fails
      }

      // Clear all stored data
      TokenManager.clearAll();

      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Logout failed. Please try again.',
      }));
    }
  }, []);

  // Setup automatic token refresh
  const setupTokenRefresh = useCallback(() => {
    const expiryTime = TokenManager.getTokenExpiryTime();
    if (!expiryTime) return;

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Calculate time until refresh (refresh 5 minutes before expiry)
    const refreshTime = expiryTime - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          // Call refresh token directly to avoid circular dependency
          const refreshTokenValue = TokenManager.getRefreshToken();
          if (!refreshTokenValue) {
            throw new Error('No refresh token available');
          }

          const response = await ApiClient.post('/auth/refresh', {
            refreshToken: refreshTokenValue,
          });

          const { user, token, refreshToken: newRefreshToken, expiresIn } = response.data as any;

          // Update tokens
          TokenManager.setTokens(token, newRefreshToken, expiresIn);
          TokenManager.setUser(user);

          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            error: null,
          }));

          // Setup next refresh recursively
          setupTokenRefresh();
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
          // Force logout on refresh failure
          await logout();
        }
      }, refreshTime);
    }
  }, [logout]); // Only depend on logout

  // Token refresh function
  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    const refreshTokenValue = TokenManager.getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    isRefreshingRef.current = true;

    try {
      const response = await ApiClient.post('/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      const { user, token, refreshToken: newRefreshToken, expiresIn } = response.data as any;

      // Update tokens
      TokenManager.setTokens(token, newRefreshToken, expiresIn);
      TokenManager.setUser(user);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        error: null,
      }));

      // Setup next refresh
      setupTokenRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and logout
      TokenManager.clearAll();
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: 'Session expired. Please log in again.',
      });
      throw error;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [setupTokenRefresh]); // Keep setupTokenRefresh dependency but make it stable

  // Load user from localStorage and verify token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = TokenManager.getUser();
      const storedToken = TokenManager.getToken();
      
      if (storedUser && storedToken) {
        try {
          // Check if token is expired
          if (TokenManager.isTokenExpired()) {
            try {
              await refreshToken();
              return;
            } catch (error) {
              // Refresh failed, continue with logout
              TokenManager.clearAll();
              setState({
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
              });
              return;
            }
          }

          // Verify token with backend
          try {
            const response = await ApiClient.verifyToken();
            // Token is valid, update user data from backend
            setState({
              user: response.data.user || storedUser,
              isAuthenticated: true,
              loading: false,
              error: null,
            });

            // Setup automatic token refresh
            setupTokenRefresh();
          } catch (error) {
            console.error('Token verification failed:', error);
            // Try to refresh token
            try {
              await refreshToken();
            } catch (refreshError) {
              // Both verification and refresh failed, clear storage
              TokenManager.clearAll();
              setState({
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
              });
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          TokenManager.clearAll();
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      }
    };

    initializeAuth();

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array - this should only run once on mount

  const login = useCallback(async (credentials: LoginData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await ApiClient.login(credentials);
      
      const { user, token, refreshToken: newRefreshToken, expiresIn } = response.data as any;
      
      // Store tokens and user data
      TokenManager.setTokens(token, newRefreshToken, expiresIn);
      TokenManager.setUser(user);
      
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      // Setup automatic token refresh
      setupTokenRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [setupTokenRefresh]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await ApiClient.register(userData);
      
      const { user, token, refreshToken: newRefreshToken, expiresIn } = response.data as any;
      
      // Store tokens and user data
      TokenManager.setTokens(token, newRefreshToken, expiresIn);
      TokenManager.setUser(user);
      
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      // Setup automatic token refresh
      setupTokenRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [setupTokenRefresh]);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...userData };
      TokenManager.setUser(updatedUser);
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  }, [state.user]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const mockLogin = useCallback(async (role: string = 'vendor') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await ApiClient.mockLogin(role);
      
      const { user, token } = response.data as any;
      
      // Store tokens and user data
      TokenManager.setTokens(token);
      TokenManager.setUser(user);
      
      setState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mock login failed';
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    clearError,
    mockLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}