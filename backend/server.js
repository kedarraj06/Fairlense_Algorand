// backend/server.js
// Node.js backend for FairLens
// Handles attestation API, indexer integration, and smart contract state management

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const algosdk = require('algosdk');
// IPFS client - using dynamic import to handle ESM module
let ipfsClient = null;
const tweetnacl = require('tweetnacl');
const winston = require('winston');

// Import services
const VerifierService = require('./services/VerifierService');
const AlgorandService = require('./services/AlgorandService');
const IPFSService = require('./services/IPFSService');

// Import routes
const authRoutes = require('./routes/auth');

// Initialize logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'fairlens-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRoutes);

// Initialize services
const algorandService = new AlgorandService();
const verifierService = new VerifierService();
const ipfsService = new IPFSService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: process.env.npm_package_version || '1.0.0',
    verifier_pubkey: verifierService.getPublicKeyHex(),
    network: process.env.ALGOD_ADDRESS || 'testnet'
  });
});

// API Routes

// Create attestation
app.post('/api/attest', [
  body('app_id').isInt({ min: 1 }).withMessage('app_id must be a positive integer'),
  body('milestone_index').isInt({ min: 0 }).withMessage('milestone_index must be a non-negative integer'),
  body('status').isIn(['PASS', 'FAIL', 'PENDING']).withMessage('status must be PASS, FAIL, or PENDING'),
  body('milestone_hash').notEmpty().withMessage('milestone_hash is required'),
  body('proof_hash').optional().isString(),
  body('metadata').optional().isObject()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      app_id,
      milestone_index,
      status,
      milestone_hash,
      proof_hash = '',
      metadata = {}
    } = req.body;

    logger.info(`Creating attestation for app ${app_id}, milestone ${milestone_index}`);

    // Create attestation
    const attestation = await verifierService.createAttestation({
      app_id,
      milestone_index,
      status,
      milestone_hash,
      proof_hash,
      timestamp: Math.floor(Date.now() / 1000)
    });

    // Store metadata on IPFS if provided
    let metadataHash = null;
    if (Object.keys(metadata).length > 0) {
      try {
        metadataHash = await ipfsService.addJSON(metadata);
        logger.info(`Metadata stored on IPFS: ${metadataHash}`);
      } catch (error) {
        logger.warn(`Failed to store metadata on IPFS: ${error.message}`);
      }
    }

    // Return attestation
    const response = {
      ...attestation,
      metadata_hash: metadataHash
    };

    logger.info(`Attestation created successfully for app ${app_id}`);
    res.json(response);

  } catch (error) {
    logger.error('Error creating attestation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get application state
app.get('/api/app/:appId/state', [
  body('appId').isInt({ min: 1 }).withMessage('appId must be a positive integer')
], async (req, res) => {
  try {
    const appId = parseInt(req.params.appId);
    
    logger.info(`Getting state for app ${appId}`);

    const state = await algorandService.getApplicationState(appId);
    
    if (!state) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    res.json(state);

  } catch (error) {
    logger.error('Error getting application state:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get application transactions
app.get('/api/app/:appId/transactions', async (req, res) => {
  try {
    const appId = parseInt(req.params.appId);
    const limit = parseInt(req.query.limit) || 50;
    
    logger.info(`Getting transactions for app ${appId}, limit ${limit}`);

    const transactions = await algorandService.getApplicationTransactions(appId, limit);
    
    res.json({
      app_id: appId,
      transactions: transactions.transactions || [],
      count: transactions.transactions ? transactions.transactions.length : 0
    });

  } catch (error) {
    logger.error('Error getting application transactions:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Verify attestation
app.post('/api/verify-attestation', [
  body('message').notEmpty().withMessage('message is required'),
  body('signature').isHexadecimal().withMessage('signature must be hex string'),
  body('public_key').isHexadecimal().withMessage('public_key must be hex string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, signature, public_key } = req.body;

    const isValid = verifierService.verifyAttestation(
      Buffer.from(message, 'utf8'),
      Buffer.from(signature, 'hex'),
      Buffer.from(public_key, 'hex')
    );

    res.json({
      valid: isValid,
      message,
      signature,
      public_key
    });

  } catch (error) {
    logger.error('Error verifying attestation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get verifier public key
app.get('/api/verifier/public-key', (req, res) => {
  res.json({
    public_key: verifierService.getPublicKeyHex(),
    algorithm: 'Ed25519'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`FairLens Backend Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Verifier Public Key: ${verifierService.getPublicKeyHex()}`);
  logger.info(`Algod Address: ${process.env.ALGOD_ADDRESS || 'testnet'}`);
  logger.info(`Indexer Address: ${process.env.INDEXER_ADDRESS || 'testnet'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
