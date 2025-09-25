// Authentication interceptor for automatic token refresh
import ApiClient from '@/services/api';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Setup automatic token refresh interceptor
export const setupAuthInterceptor = () => {
  // Add response interceptor to handle token refresh
  ApiClient.addResponseInterceptor(async (response) => {
    const originalRequest = response;

    if (response.status === 401 && !isRefreshing) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry the original request with new token
            return fetch(response.url, {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              },
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const { token, refreshToken: newRefreshToken, expiresIn } = data.data;

            // Update stored tokens
            localStorage.setItem('authToken', token);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            if (expiresIn) {
              const expiryTime = Date.now() + (expiresIn * 1000);
              localStorage.setItem('tokenExpiry', expiryTime.toString());
            }

            // Process queued requests
            processQueue(null, token);

            // Retry the original request
            return fetch(response.url, {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                'Authorization': `Bearer ${token}`,
              },
            });
          } else {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            
            processQueue(new Error('Token refresh failed'), null);
            window.location.href = '/login';
            
            throw new Error('Token refresh failed');
          }
        } catch (error) {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenExpiry');
          
          processQueue(error, null);
          window.location.href = '/login';
          
          throw error;
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return response;
  });
};

// Check if token needs refresh (call this periodically or before important requests)
export const checkTokenExpiry = async (): Promise<boolean> => {
  const expiryTime = localStorage.getItem('tokenExpiry');
  if (!expiryTime) return false;

  const timeUntilExpiry = parseInt(expiryTime) - Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  // If token expires in less than 5 minutes, refresh it
  if (timeUntilExpiry < fiveMinutes) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken && !isRefreshing) {
      try {
        isRefreshing = true;
        const response = await ApiClient.post('/auth/refresh', { refreshToken });
        const { token, refreshToken: newRefreshToken, expiresIn } = response.data;

        localStorage.setItem('authToken', token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        if (expiresIn) {
          const newExpiryTime = Date.now() + (expiresIn * 1000);
          localStorage.setItem('tokenExpiry', newExpiryTime.toString());
        }

        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiry');
        window.location.href = '/login';
        return false;
      } finally {
        isRefreshing = false;
      }
    }
  }

  return false;
};