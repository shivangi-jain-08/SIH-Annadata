// API Configuration for React Native App

// Detect if running on development or production
const __DEV__ = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Your local machine IP address (replace with your actual IP)
const LOCAL_IP = '10.224.219.103';

// API Configuration
const API_CONFIG = {
  // Base URL for different environments
  BASE_URL: __DEV__ 
    ? `http://${LOCAL_IP}:3000/api`  // Development - your local machine IP
    : 'https://your-production-domain.com/api', // Production - replace with your domain

  // Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    
    // Users
    USERS_SEARCH: '/users/search/query',
    
    // Products
    PRODUCTS: '/products',
    
    // Orders
    ORDERS: '/orders',
    
    // ML Services
    DISEASE_DETECTION: '/ml/disease-detection',
    HARDWARE_MESSAGES: '/ml/hardware-messages',
    
    // Location
    UPDATE_LOCATION: '/location/update',
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    
    // Health Check
    HEALTH: '/health',
  },

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function for API requests with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildUrl(endpoint);
  
  const config = {
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw new Error('Network request failed. Please check your internet connection and try again.');
  }
};

// Export the configuration
export default API_CONFIG;

// Network detection helper
export const checkNetworkConnection = async () => {
  try {
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.HEALTH), {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Instructions for different environments:
/*
DEVELOPMENT SETUP:
1. Make sure your backend server is running on port 3000
2. Update LOCAL_IP above with your actual machine IP address
3. On iOS Simulator: Use your machine's IP address (current setup)
4. On Android Emulator: Use 10.0.2.2:3000 for localhost mapping
5. On Physical Device: Use your machine's IP address (current setup)

ANDROID EMULATOR SPECIFIC:
If testing on Android Emulator, change LOCAL_IP to '10.0.2.2'

TO GET YOUR IP ADDRESS:
macOS: ifconfig | grep "inet " | grep -v 127.0.0.1
Windows: ipconfig
Linux: ip addr show

PRODUCTION SETUP:
1. Replace the production BASE_URL with your actual domain
2. Ensure HTTPS is used for production
3. Update any environment-specific configurations
*/