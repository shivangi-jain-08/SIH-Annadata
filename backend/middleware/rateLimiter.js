const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('./errorHandler');

/**
 * General API rate limiter
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_ERROR',
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    const error = new RateLimitError('Too many requests from this IP, please try again later.');
    res.status(429).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }
});

/**
 * Authentication rate limiter (stricter)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_ERROR',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    const error = new RateLimitError('Too many authentication attempts, please try again later');
    res.status(429).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }
});

/**
 * ML API rate limiter (more restrictive)
 */
const mlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_ML_MAX_REQUESTS) || 10, // limit each IP to 10 ML requests per minute
  message: {
    success: false,
    error: {
      code: 'ML_RATE_LIMIT_ERROR',
      message: 'Too many ML requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per user for ML requests
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    const error = new RateLimitError('Too many ML requests, please try again later');
    res.status(429).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }
});

/**
 * Upload rate limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 upload requests per minute
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_ERROR',
      message: 'Too many upload requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const error = new RateLimitError('Too many upload requests, please try again later');
    res.status(429).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }
});

/**
 * Notification rate limiter
 */
const notificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 notification requests per minute
  message: {
    success: false,
    error: {
      code: 'NOTIFICATION_RATE_LIMIT_ERROR',
      message: 'Too many notification requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    const error = new RateLimitError('Too many notification requests, please try again later');
    res.status(429).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      },
      timestamp: new Date().toISOString(),
      requestId: req.id
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  mlLimiter,
  uploadLimiter,
  notificationLimiter
};