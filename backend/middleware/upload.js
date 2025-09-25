const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine subdirectory based on the endpoint
    let subDir;
    if (req.originalUrl.includes('/disease-detection')) {
      subDir = path.join(uploadDir, 'disease-images');
    } else {
      subDir = path.join(uploadDir, 'products');
    }

    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }
    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);

    // Use different prefix based on endpoint
    let prefix = 'product';
    if (req.originalUrl.includes('/disease-detection')) {
      prefix = 'disease';
    }

    cb(null, `${prefix}-${uniqueSuffix}${extension}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES
    ? process.env.ALLOWED_IMAGE_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

/**
 * Middleware for single image upload
 */
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err) {
        logger.error('File upload error:', err);

        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Maximum size is 5MB'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected field name for file upload'
            });
          }
        }

        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }

      // Add file URL to request if file was uploaded
      if (req.file) {
        // Determine the correct path based on endpoint
        let subPath = 'products';
        if (req.originalUrl.includes('/disease-detection')) {
          subPath = 'disease-images';
        }

        req.fileUrl = `/uploads/${subPath}/${req.file.filename}`;
        logger.info('File uploaded successfully', {
          filename: req.file.filename,
          size: req.file.size,
          path: req.fileUrl,
          userId: req.user?.id
        });
      }

      next();
    });
  };
};

/**
 * Middleware for multiple image upload
 */
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);

    multipleUpload(req, res, (err) => {
      if (err) {
        logger.error('Multiple file upload error:', err);

        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'One or more files are too large. Maximum size is 5MB per file'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum ${maxCount} files allowed`
            });
          }
        }

        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }

      // Add file URLs to request if files were uploaded
      if (req.files && req.files.length > 0) {
        req.fileUrls = req.files.map(file => `/uploads/products/${file.filename}`);
        logger.info('Multiple files uploaded successfully', {
          count: req.files.length,
          filenames: req.files.map(f => f.filename),
          userId: req.user?.id
        });
      }

      next();
    });
  };
};

/**
 * Delete uploaded file
 */
const deleteFile = (filename) => {
  try {
    const filePath = path.join(uploadDir, 'products', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('File deleted successfully', { filename });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('File deletion failed:', error);
    return false;
  }
};

/**
 * Get file URL from filename
 */
const getFileUrl = (filename) => {
  return `/uploads/products/${filename}`;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  getFileUrl
};