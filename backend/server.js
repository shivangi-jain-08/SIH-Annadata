require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
// Import utilities
const logger = require('./utils/logger');
const { 
  requestIdMiddleware, 
  requestLogger, 
  errorHandler, 
  notFoundHandler 
} = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import configurations
const config = require('./config');
const { connectDB } = require('./config/database');
const redisClient = require('./config/redis');
const firebaseAdmin = require('./config/firebase');
const socketHandler = require('./socket/socketHandler');

class Server {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = config.PORT;
  }

  /**
   * Initialize the server
   */
  async initialize() {
    try {
      // Connect to databases
      await this.connectDatabases();
      
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes (will be added in later tasks)
      this.setupRoutes();
      
      // Setup error handling
      this.setupErrorHandling();
      
      // Initialize Socket.io
      this.initializeSocketIO();
      
      logger.info('Server initialized successfully');
    } catch (error) {
      logger.error('Server initialization failed:', error);
      process.exit(1);
    }
  }

  /**
   * Connect to databases
   */
  async connectDatabases() {
    try {
      // Connect to MongoDB
      await connectDB();
      
      // Connect to Redis (optional for prototype)
      try {
        await redisClient.connect();
      } catch (redisError) {
        logger.warn('Redis connection failed, continuing without Redis:', redisError.message);
      }

      // Initialize Firebase (optional for prototype)
      try {
        firebaseAdmin.initialize();
      } catch (firebaseError) {
        logger.warn('Firebase initialization failed, continuing without FCM:', firebaseError.message);
      }
      
      logger.info('Database connections established');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: true,
      credentials: config.CORS.CREDENTIALS,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    }));

    // Compression
    this.app.use(compression());

    // Request parsing - exclude file upload routes from JSON parsing
    this.app.use((req, res, next) => {
      // Skip JSON parsing for file upload endpoints
      if ((req.path.includes('/disease-detection') || req.originalUrl.includes('/disease-detection')) && req.method === 'POST') {
        console.log('Skipping JSON parsing for disease detection endpoint');
        return next();
      }
      express.json({ limit: '10mb' })(req, res, next);
    });
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID generation
    this.app.use(requestIdMiddleware);

    // Serve static files
    this.app.use('/uploads', express.static('uploads'));

    // Logging
    if (config.NODE_ENV !== 'test') {
      this.app.use(morgan('combined', { stream: logger.stream }));
      this.app.use(requestLogger);
    }

    // Rate limiting
    // this.app.use(generalLimiter);

    // Trust proxy
    this.app.set('trust proxy', 1);

    logger.info('Middleware setup completed');
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // Import API routes
    const apiRoutes = require('./routes');

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Annadata Backend API',
        version: '1.0.0',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
          api: '/api',
          health: '/api/health',
          docs: '/api/docs'
        }
      });
    });

    // API routes
    this.app.use('/api', apiRoutes);

    logger.info('Routes setup completed');
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // 404 handler for undefined routes
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown('SIGTERM');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      this.gracefulShutdown('SIGTERM');
    });

    // Setup graceful shutdown
    this.setupGracefulShutdown();

    logger.info('Error handling setup completed');
  }

  /**
   * Setup graceful shutdown
   */
  setupGracefulShutdown() {
    // Handle shutdown signals
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));

    logger.info('Graceful shutdown handlers setup completed');
  }

  /**
   * Graceful shutdown
   */
  async gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // Stop accepting new connections
    this.server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close Socket.IO connections
        if (socketHandler.getIO()) {
          socketHandler.getIO().close();
          logger.info('Socket.IO server closed');
        }

        // Close database connections
        if (redisClient.isReady()) {
          await redisClient.disconnect();
          logger.info('Redis connection closed');
        }

        // MongoDB connection will be closed by Mongoose
        logger.info('Database connections closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }

  /**
   * Initialize Socket.IO
   */
  initializeSocketIO() {
    try {
      socketHandler.initialize(this.server);
      logger.info('Socket.IO initialized successfully');
    } catch (error) {
      logger.error('Socket.IO initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start() {
    try {
      await this.initialize();
      
      this.server.listen(this.port, () => {
        logger.info(`Server running on port ${this.port} in ${config.NODE_ENV} mode`);
        logger.info(`API available at: http://localhost:${this.port}/api`);
        
        // Log server startup information
        this.logStartupInfo();
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Log startup information
   */
  logStartupInfo() {
    const startupInfo = {
      environment: config.NODE_ENV,
      port: this.port,
      // API versioning removed for simplicity
      mongodb: config.MONGODB_URI ? 'Connected' : 'Not configured',
      redis: redisClient.isReady() ? 'Connected' : 'Not connected',
      firebase: firebaseAdmin.isReady() ? 'Connected' : 'Not connected',
      socketIO: socketHandler.getIO() ? 'Initialized' : 'Not initialized',
      features: {
        socketIO: config.FEATURES.SOCKET_IO_ENABLED,
        redis: config.FEATURES.REDIS_ENABLED,
        fcm: config.FEATURES.FCM_ENABLED,
        sms: config.FEATURES.SMS_ENABLED,
        mlService: config.FEATURES.ML_SERVICE_ENABLED
      },
      timestamp: new Date().toISOString(),
    };

    logger.info('Server startup completed:', startupInfo);

    // Log available endpoints
    const endpoints = [
      'GET  /api/health - Health check',
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login',
      'GET  /api/products - Browse products',
      'POST /api/orders - Create order',
      'GET  /api/ml/hardware-messages - Get hardware messages',
      'POST /api/ml/disease-detection - Disease detection',
      'POST /api/location/update - Update vendor location',
      'GET  /api/notifications - Get notifications'
    ];

    logger.info('Available endpoints:', endpoints);
  }

  /**
   * Get server instance
   */
  getApp() {
    return this.app;
  }

  /**
   * Get HTTP server instance
   */
  getServer() {
    return this.server;
  }
}

// Create and start server
const server = new Server();

// Start server if this file is run directly
if (require.main === module) {
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = server;