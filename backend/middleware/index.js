// Export all middleware from a central location
const auth = require('./auth');
const errorHandler = require('./errorHandler');
const upload = require('./upload');
const validation = require('./validation');

module.exports = {
  // Authentication and authorization
  authenticate: auth.authenticate,
  authorize: auth.authorize,
  optionalAuth: auth.optionalAuth,
  checkOwnership: auth.checkOwnership,

  // Error handling
  AppError: errorHandler.AppError,
  ValidationError: errorHandler.ValidationError,
  AuthenticationError: errorHandler.AuthenticationError,
  AuthorizationError: errorHandler.AuthorizationError,
  NotFoundError: errorHandler.NotFoundError,
  ConflictError: errorHandler.ConflictError,
  RateLimitError: errorHandler.RateLimitError,
  ServiceUnavailableError: errorHandler.ServiceUnavailableError,
  requestIdMiddleware: errorHandler.requestIdMiddleware,
  requestLogger: errorHandler.requestLogger,
  errorHandler: errorHandler.errorHandler,
  notFoundHandler: errorHandler.notFoundHandler,
  asyncHandler: errorHandler.asyncHandler,
  healthCheck: errorHandler.healthCheck,

  // File upload
  uploadSingle: upload.uploadSingle,
  uploadMultiple: upload.uploadMultiple,
  deleteFile: upload.deleteFile,
  getFileUrl: upload.getFileUrl,

  // Validation
  validateRequest: validation.validateRequest,
  isValidObjectId: validation.isValidObjectId,
  isValidCoordinates: validation.isValidCoordinates,
  isValidImageUrl: validation.isValidImageUrl,
  isValidPhoneNumber: validation.isValidPhoneNumber
};