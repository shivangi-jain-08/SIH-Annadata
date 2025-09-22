/**
 * Centralized configuration management
 */

const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  // API_VERSION removed for simplicity - no versioning needed for prototype

  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/annadata',
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/annadata_test',

  // Redis configuration
  REDIS: {
    URL: process.env.REDIS_URL,
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: parseInt(process.env.REDIS_PORT) || 6379,
    PASSWORD: process.env.REDIS_PASSWORD || '',
    DB: parseInt(process.env.REDIS_DB) || 0
  },

  // JWT configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // ML Service configuration
  ML_SERVICE: {
    URL: process.env.ML_SERVICE_URL || 'http://localhost:5000',
    API_KEY: process.env.ML_SERVICE_API_KEY || '',
    TIMEOUT: parseInt(process.env.ML_SERVICE_TIMEOUT) || 30000
  },

  // File upload configuration
  UPLOAD: {
    PATH: process.env.UPLOAD_PATH || 'uploads/',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    ALLOWED_IMAGE_TYPES: process.env.ALLOWED_IMAGE_TYPES ? 
      process.env.ALLOWED_IMAGE_TYPES.split(',') : 
      ['image/jpeg', 'image/png', 'image/webp']
  },

  // Firebase configuration
  FCM: {
    PROJECT_ID: process.env.FCM_PROJECT_ID || '',
    PRIVATE_KEY_ID: process.env.FCM_PRIVATE_KEY_ID || '',
    PRIVATE_KEY: process.env.FCM_PRIVATE_KEY || '',
    CLIENT_EMAIL: process.env.FCM_CLIENT_EMAIL || '',
    CLIENT_ID: process.env.FCM_CLIENT_ID || '',
    AUTH_URI: process.env.FCM_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    TOKEN_URI: process.env.FCM_TOKEN_URI || 'https://oauth2.googleapis.com/token'
  },

  // SMS configuration
  SMS: {
    PROVIDER: process.env.SMS_PROVIDER || 'twilio',
    API_KEY: process.env.SMS_API_KEY || '',
    API_SECRET: process.env.SMS_API_SECRET || '',
    FROM_NUMBER: process.env.SMS_FROM_NUMBER || ''
  },

  // Security configuration
  SECURITY: {
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    RATE_LIMIT_ML_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_ML_MAX_REQUESTS) || 10
  },

  // Logging configuration
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || 'info',
    FILE_PATH: process.env.LOG_FILE_PATH || 'logs/',
    MAX_SIZE: process.env.LOG_MAX_SIZE || '20m',
    MAX_FILES: process.env.LOG_MAX_FILES || '14d'
  },

  // CORS configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000', 'http://localhost:19006'],
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true'
  },

  // Cache configuration
  CACHE: {
    TTL_DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT) || 3600, // 1 hour
    TTL_ML_RESULTS: parseInt(process.env.CACHE_TTL_ML_RESULTS) || 86400, // 24 hours
    TTL_USER_SESSION: parseInt(process.env.CACHE_TTL_USER_SESSION) || 1800, // 30 minutes
    TTL_VENDOR_LOCATION: parseInt(process.env.CACHE_TTL_VENDOR_LOCATION) || 300 // 5 minutes
  },

  // Feature flags
  FEATURES: {
    SOCKET_IO_ENABLED: process.env.SOCKET_IO_ENABLED !== 'false',
    REDIS_ENABLED: process.env.REDIS_ENABLED !== 'false',
    FCM_ENABLED: process.env.FCM_ENABLED !== 'false',
    SMS_ENABLED: process.env.SMS_ENABLED !== 'false',
    ML_SERVICE_ENABLED: process.env.ML_SERVICE_ENABLED !== 'false'
  }
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
  const required = [
    'JWT.SECRET',
    'MONGODB_URI'
  ];

  const missing = [];

  for (const key of required) {
    const keys = key.split('.');
    let value = config;
    
    for (const k of keys) {
      value = value[k];
      if (value === undefined || value === '') {
        missing.push(key);
        break;
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
};

/**
 * Get configuration for specific environment
 */
const getConfig = () => {
  // Validate configuration
  validateConfig();

  // Return configuration based on environment
  if (config.NODE_ENV === 'test') {
    return {
      ...config,
      MONGODB_URI: config.MONGODB_TEST_URI,
      LOGGING: {
        ...config.LOGGING,
        LEVEL: 'error' // Reduce logging in tests
      }
    };
  }

  return config;
};

module.exports = getConfig();