// backend/middleware/security.js
// Security middleware for FairLens backend

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later'
);

const strictRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // 20 requests per window
  'Too many requests for this endpoint, please try again later'
);

const attestationRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 requests per minute
  'Too many attestation requests, please slow down'
);

// Security headers configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://testnet-algorand.api.purestake.io", "https://mainnet-algorand.api.purestake.io"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    }
  }

  next();
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    // Log based on status code
    if (res.statusCode >= 400) {
      console.error('HTTP Error:', logData);
    } else {
      console.log('HTTP Request:', logData);
    }
  });

  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let errorResponse = {
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.error = 'Validation error';
    errorResponse.message = err.message;
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse.error = 'Unauthorized';
    errorResponse.message = 'Invalid or missing authentication';
    return res.status(401).json(errorResponse);
  }

  if (err.message === 'Not allowed by CORS') {
    errorResponse.error = 'CORS error';
    errorResponse.message = 'Origin not allowed';
    return res.status(403).json(errorResponse);
  }

  // Default to 500
  res.status(500).json(errorResponse);
};

// Security validation rules
const securityValidations = {
  appId: body('app_id')
    .isInt({ min: 1 })
    .withMessage('app_id must be a positive integer')
    .toInt(),
  
  milestoneIndex: body('milestone_index')
    .isInt({ min: 0 })
    .withMessage('milestone_index must be a non-negative integer')
    .toInt(),
  
  status: body('status')
    .isIn(['PASS', 'FAIL', 'PENDING'])
    .withMessage('status must be PASS, FAIL, or PENDING'),
  
  milestoneHash: body('milestone_hash')
    .isLength({ min: 1, max: 100 })
    .withMessage('milestone_hash must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('milestone_hash must contain only alphanumeric characters'),
  
  proofHash: body('proof_hash')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('proof_hash must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('proof_hash must contain only alphanumeric characters'),
  
  message: body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('message must be between 1 and 1000 characters'),
  
  signature: body('signature')
    .isHexadecimal()
    .withMessage('signature must be a valid hexadecimal string')
    .isLength({ min: 64, max: 128 })
    .withMessage('signature must be between 64 and 128 characters'),
  
  publicKey: body('public_key')
    .isHexadecimal()
    .withMessage('public_key must be a valid hexadecimal string')
    .isLength({ min: 64, max: 64 })
    .withMessage('public_key must be exactly 64 characters')
};

module.exports = {
  generalRateLimit,
  strictRateLimit,
  attestationRateLimit,
  securityHeaders,
  validateInput,
  sanitizeInput,
  corsOptions,
  requestLogger,
  errorHandler,
  securityValidations
};
