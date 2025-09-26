import {
  ApiResponse,
  AuthResponse,
  RegisterData,
  LoginData,
  ProductsResponse,
  ProductData,
  ProductFilters,
  OrdersResponse,
  OrderData,
  CropRecommendationsResponse,
  DiseaseDetectionResponse,
  VendorsResponse,
  Location,
  NotificationsResponse,
} from '@/types/api';

// Enhanced error types
export class ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
  
  constructor(
    message: string,
    status?: number,
    code?: string,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export class NetworkError extends Error {
  originalError?: Error;
  
  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

// Request configuration interface
interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition: (error: Error, attempt: number) => boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultRetryConfig: RetryConfig;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.defaultRetryConfig = {
      maxRetries: 1, // Reduced retries to prevent resource exhaustion
      baseDelay: 2000, // Increased delay between retries
      maxDelay: 5000, // Reduced max delay
      retryCondition: (error: Error, attempt: number) => {
        // Only retry on specific network errors, not on resource exhaustion
        if (error instanceof NetworkError && !error.message.includes('INSUFFICIENT_RESOURCES')) return true;
        if (error instanceof ApiError && error.status && error.status >= 500) return true;
        // Don't retry on 4xx client errors (except 408, 429)
        if (error instanceof ApiError && error.status) {
          return error.status === 408 || error.status === 429;
        }
        return false;
      }
    };

    // Add default request interceptor for authentication
    this.addRequestInterceptor((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
      return config;
    });

    // Add default response interceptor for error handling
    this.addResponseInterceptor(async (response) => {
      if (response.status === 401) {
        // Handle token expiration
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new ApiError('Authentication required', 401, 'UNAUTHORIZED');
      }
      return response;
    });
  }

  // Interceptor management
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  // Enhanced sleep function for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Calculate exponential backoff delay
  private calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter
    return Math.min(jitteredDelay, maxDelay);
  }

  // Enhanced request method with retry logic
  private async makeRequest<T = any>(
    endpoint: string, 
    config: RequestConfig = {},
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const finalRetryConfig = { ...this.defaultRetryConfig, ...retryConfig };
    const { retries = finalRetryConfig.maxRetries, timeout = 10000, ...requestConfig } = config; // Reduced timeout to 10s

    let lastError: Error;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        // Apply request interceptors
        let finalConfig = { ...requestConfig };
        for (const interceptor of this.requestInterceptors) {
          finalConfig = await interceptor(finalConfig);
        }

        // Set default headers
        finalConfig.headers = {
          'Content-Type': 'application/json',
          ...finalConfig.headers,
        };

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...finalConfig,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Apply response interceptors
          let finalResponse = response;
          for (const interceptor of this.responseInterceptors) {
            finalResponse = await interceptor(finalResponse);
          }

          if (!finalResponse.ok) {
            const errorData = await finalResponse.json().catch(() => ({ 
              message: 'Request failed',
              error: { code: 'UNKNOWN_ERROR', message: finalResponse.statusText }
            }));
            
            throw new ApiError(
              errorData.message || errorData.error?.message || `HTTP ${finalResponse.status}: ${finalResponse.statusText}`,
              finalResponse.status,
              errorData.error?.code || 'HTTP_ERROR',
              errorData
            );
          }

          const result = await finalResponse.json();

          if (!result.success) {
            throw new ApiError(
              result.message || result.error?.message || 'API request failed',
              finalResponse.status,
              result.error?.code || 'API_ERROR',
              result
            );
          }

          // Log successful request in development
          if (import.meta.env?.DEV) {
            console.log(`✅ API Request: ${finalConfig.method || 'GET'} ${endpoint}`, result);
          }

          return result;

        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError instanceof ApiError) {
            throw fetchError;
          }

          // Handle network errors
          if (fetchError instanceof Error) {
            if (fetchError.name === 'AbortError') {
              throw new NetworkError('Request timeout', fetchError);
            }
            throw new NetworkError('Network error occurred', fetchError);
          }

          throw new NetworkError('Unknown network error');
        }

      } catch (error) {
        lastError = error as Error;

        // Don't retry if it's the last attempt or if retry condition is not met
        if (attempt > retries || !finalRetryConfig.retryCondition(lastError, attempt)) {
          // Log error in development
          if (import.meta.env?.DEV) {
            console.error(`❌ API Request Failed: ${config.method || 'GET'} ${endpoint}`, lastError);
          }
          throw lastError;
        }

        // Calculate delay and wait before retry
        const delay = this.calculateDelay(attempt, finalRetryConfig.baseDelay, finalRetryConfig.maxDelay);
        
        if (import.meta.env?.DEV) {
          console.warn(`🔄 Retrying API request (${attempt}/${retries}): ${config.method || 'GET'} ${endpoint} in ${delay}ms`);
        }

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  // Public request method (backward compatibility)
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, options);
  }

  // Enhanced request methods with specific configurations
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // File upload method with progress support
  async uploadFile<T = any>(
    endpoint: string, 
    formData: FormData, 
    config?: RequestConfig & { onProgress?: (progress: number) => void }
  ): Promise<T> {
    const { onProgress, ...requestConfig } = config || {};

    // Remove Content-Type header for FormData (let browser set it with boundary)
    const headers: any = { ...requestConfig.headers };
    delete headers['Content-Type'];

    return this.makeRequest<T>(endpoint, {
      ...requestConfig,
      method: 'POST',
      body: formData,
      headers,
    });
  }

  // Authentication methods
  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', userData, {
      retries: 1, // Reduce retries for auth operations
    });
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials, {
      retries: 1, // Reduce retries for auth operations
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/logout', undefined, {
      retries: 0, // Don't retry logout
    });
  }

  async verifyToken(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/auth/verify-token');
  }

  async mockLogin(role: string = 'vendor'): Promise<AuthResponse> {
    return this.post<AuthResponse>('/test-setup/mock-login', { role });
  }

  // User methods
  async getProfile(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/users/profile');
  }

  async updateProfile(userData: Partial<RegisterData>): Promise<ApiResponse> {
    return this.put<ApiResponse>('/users/profile', userData);
  }

  // Product methods
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.get<ProductsResponse>(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async createProduct(productData: ProductData): Promise<ApiResponse> {
    return this.post<ApiResponse>('/products', productData);
  }

  async updateProduct(productId: string, productData: Partial<ProductData>): Promise<ApiResponse> {
    return this.put<ApiResponse>(`/products/${productId}`, productData);
  }

  async deleteProduct(productId: string): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/products/${productId}`);
  }

  async searchProducts(query: string): Promise<ProductsResponse> {
    return this.get<ProductsResponse>(`/products/search?q=${encodeURIComponent(query)}`);
  }

  async getProductsByCategory(category: string): Promise<ProductsResponse> {
    return this.get<ProductsResponse>(`/products/category/${category}`);
  }

  async getMyProducts(): Promise<ProductsResponse> {
    return this.get<ProductsResponse>('/products/my-products');
  }

  async getProductsByRole(role: string): Promise<ProductsResponse> {
    return this.get<ProductsResponse>(`/products/by-role/${role}`);
  }

  async getConsumerProducts(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    radius?: number;
  } = {}): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    return this.get<ProductsResponse>(`/products/for-consumers${queryString ? `?${queryString}` : ''}`);
  }

  async updateProductAvailability(productId: string, data: { 
    availableQuantity?: number; 
    isActive?: boolean; 
  }): Promise<ApiResponse> {
    return this.patch<ApiResponse>(`/products/${productId}/availability`, data);
  }

  async getConsumerSalesStats(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/products/consumer-sales-stats');
  }

  // Order methods
  async getMyOrders(status?: string): Promise<OrdersResponse> {
    const queryString = status ? `?status=${status}` : '';
    return this.get<OrdersResponse>(`/orders/my-orders${queryString}`);
  }

  async createOrder(orderData: OrderData): Promise<ApiResponse> {
    return this.post<ApiResponse>('/orders', orderData);
  }

  async getOrder(orderId: string): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string, deliveryDate?: string): Promise<ApiResponse> {
    return this.patch<ApiResponse>(`/orders/${orderId}/status`, { status, deliveryDate });
  }

  async cancelOrder(orderId: string, reason: string): Promise<ApiResponse> {
    return this.patch<ApiResponse>(`/orders/${orderId}/cancel`, { reason });
  }

  async getOrderStats(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/orders/stats');
  }

  async getNearbyOrders(location: Location, radius = 5000): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/orders/nearby?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`);
  }

  async getConsumerOrders(status?: string, limit = 20): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    return this.get<ApiResponse>(`/orders/consumer-orders${queryString ? `?${queryString}` : ''}`);
  }

  // ML methods
  async getCropRecommendations(limit?: number): Promise<CropRecommendationsResponse> {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.get<CropRecommendationsResponse>(`/ml/crop-recommendations${queryString}`);
  }

  async getLatestCropRecommendation(): Promise<CropRecommendationsResponse> {
    return this.get<CropRecommendationsResponse>('/ml/crop-recommendations/latest');
  }

  async getSoilReports(limit?: number): Promise<ApiResponse> {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.get<ApiResponse>(`/ml/soil-reports${queryString}`);
  }

  async getLatestSoilReport(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/ml/soil-reports/latest');
  }

  async getHardwareMessages(limit?: number): Promise<ApiResponse> {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.get<ApiResponse>(`/ml/hardware-messages${queryString}`);
  }

  async getLatestHardwareMessage(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/ml/hardware-messages/latest');
  }

  async detectDisease(
    image: File, 
    cropType?: string, 
    location?: Location,
    onProgress?: (progress: number) => void
  ): Promise<DiseaseDetectionResponse> {
    console.log('detectDisease called with:', { 
      imageName: image.name, 
      imageSize: image.size, 
      imageType: image.type,
      cropType, 
      location 
    });

    const formData = new FormData();
    formData.append('image', image);
    if (cropType) formData.append('cropType', cropType);
    if (location) formData.append('location', JSON.stringify([location.longitude, location.latitude]));

    console.log('FormData created, calling uploadFile...');

    return this.uploadFile<DiseaseDetectionResponse>('/ml/disease-detection', formData, {
      onProgress,
      timeout: 60000, // Longer timeout for ML processing
    });
  }

  async getDiseaseReports(limit?: number): Promise<ApiResponse> {
    const queryString = limit ? `?limit=${limit}` : '';
    return this.get<ApiResponse>(`/ml/disease-reports${queryString}`);
  }

  async getDiseaseReportsByFarmer(farmerId: string): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/ml/disease-reports/farmer/${farmerId}`);
  }

  async getDiseaseReportsByDisease(diseaseName: string): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/ml/disease-reports/disease/${diseaseName}`);
  }

  async getMLHealth(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/ml/health');
  }

  // Location methods
  async updateLocation(location: Location): Promise<ApiResponse> {
    return this.post<ApiResponse>('/location/update', location);
  }

  async getNearbyVendors(location: Location, radius = 5000): Promise<VendorsResponse> {
    return this.get<VendorsResponse>(`/location/nearby-vendors?longitude=${location.longitude}&latitude=${location.latitude}&radius=${radius}`);
  }

  async getNearbyConsumers(location: Location, radius = 5000): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/location/nearby-consumers?longitude=${location.longitude}&latitude=${location.latitude}&radius=${radius}`);
  }

  async getActiveVendors(): Promise<VendorsResponse> {
    return this.get<VendorsResponse>('/location/active-vendors');
  }

  async goOffline(): Promise<ApiResponse> {
    return this.delete<ApiResponse>('/location/offline');
  }

  async getLocationStats(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/location/stats');
  }

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/location/distance?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}`);
  }

  async updateVendorStatus(status: {
    isOnline?: boolean;
    deliveryRadius?: number;
    acceptingOrders?: boolean;
  }): Promise<ApiResponse> {
    return this.patch<ApiResponse>('/location/vendor-status', status);
  }

  async getDeliveryOpportunities(location: Location, radius = 5000): Promise<ApiResponse> {
    return this.get<ApiResponse>(`/location/delivery-opportunities?latitude=${location.latitude}&longitude=${location.longitude}&radius=${radius}`);
  }

  async sendProximityNotification(data: {
    latitude: number;
    longitude: number;
    message?: string;
    products?: string[];
  }): Promise<ApiResponse> {
    return this.post<ApiResponse>('/location/notify-proximity', data);
  }

  // Notification methods
  async getNotifications(page = 1, limit = 20): Promise<NotificationsResponse> {
    return this.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`);
  }

  async getNotificationStats(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/notifications/stats');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse> {
    return this.patch<ApiResponse>(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.patch<ApiResponse>('/notifications/mark-all-read');
  }

  async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<ApiResponse> {
    return this.post<ApiResponse>('/notifications/send', data);
  }

  // Health check method
  async healthCheck(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/health', {
      retries: 1,
      timeout: 5000,
    });
  }
}

export default new ApiClient();