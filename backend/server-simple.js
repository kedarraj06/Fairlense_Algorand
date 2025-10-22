// Simple backend server for FairLens (without IPFS for now)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const algosdk = require('algosdk');
const tweetnacl = require('tweetnacl');
const winston = require('winston');

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

// Initialize Algorand clients
const ALGOD_TOKEN = process.env.ALGOD_TOKEN || '';
const ALGOD_ADDRESS = process.env.ALGOD_ADDRESS || 'https://testnet-algorand.api.purestake.io/ps2';
const INDEXER_TOKEN = process.env.INDEXER_TOKEN || '';
const INDEXER_ADDRESS = process.env.INDEXER_ADDRESS || 'https://testnet-algorand.api.purestake.io/idx2';

let algodClient, indexerClient;

try {
  algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_ADDRESS);
  indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_ADDRESS);
  logger.info('Algorand clients initialized');
} catch (error) {
  logger.error('Failed to initialize Algorand clients:', error);
}

// Simple verifier service
class SimpleVerifier {
  constructor() {
    this.privateKey = process.env.VERIFIER_PRIVATE_KEY;
    if (this.privateKey) {
      try {
        this.signingKey = tweetnacl.sign.keyPair.fromSeed(Buffer.from(this.privateKey, 'hex'));
      } catch (error) {
        logger.warn('Invalid private key, generating new one');
        this.signingKey = tweetnacl.sign.keyPair();
      }
    } else {
      this.signingKey = tweetnacl.sign.keyPair();
      logger.warn('No private key provided, generated new one');
    }
    this.publicKey = Buffer.from(this.signingKey.publicKey).toString('hex');
  }

  createAttestation(data) {
    const { app_id, milestone_index, status, milestone_hash, proof_hash = '', timestamp } = data;
    const message = `app:${app_id}|ms:${milestone_index}|status:${status}|ts:${timestamp}|hash:${milestone_hash}|proof:${proof_hash}`;
    const messageBytes = Buffer.from(message, 'utf8');
    const signature = tweetnacl.sign.detached(messageBytes, this.signingKey.secretKey);
    
    return {
      app_id,
      milestone_index,
      status,
      timestamp,
      milestone_hash,
      proof_hash,
      verifier_pubkey: this.publicKey,
      message,
      signature: Buffer.from(signature).toString('hex')
    };
  }

  getPublicKeyHex() {
    return this.publicKey;
  }
}

const verifier = new SimpleVerifier();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0',
    verifier_pubkey: verifier.getPublicKeyHex(),
    network: ALGOD_ADDRESS
  });
});

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
    const attestation = verifier.createAttestation({
      app_id,
      milestone_index,
      status,
      milestone_hash,
      proof_hash,
      timestamp: Math.floor(Date.now() / 1000)
    });

    logger.info(`Attestation created successfully for app ${app_id}`);
    res.json(attestation);

  } catch (error) {
    logger.error('Error creating attestation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get application state
app.get('/api/app/:appId/state', async (req, res) => {
  try {
    const appId = parseInt(req.params.appId);
    
    logger.info(`Getting state for app ${appId}`);

    if (!indexerClient) {
      return res.status(503).json({
        error: 'Indexer not available',
        message: 'Algorand indexer client not initialized'
      });
    }

    const appInfo = await indexerClient.lookupApplicationByID(appId).do();
    
    if (!appInfo || !appInfo.application) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    const app = appInfo.application;
    
    // Parse global state
    const globalState = {};
    if (app.params && app.params['global-state']) {
      for (const state of app.params['global-state']) {
        const key = Buffer.from(state.key, 'base64').toString('utf8');
        let value;
        
        if (state.value.type === 1) { // bytes
          value = Buffer.from(state.value.bytes, 'base64').toString('utf8');
        } else if (state.value.type === 2) { // uint64
          value = state.value.uint;
        } else {
          value = state.value;
        }
        
        globalState[key] = value;
      }
    }

    const result = {
      app_id: appId,
      global_state: globalState,
      creator: app.creator,
      created_at: app['created-at-round'],
      updated_at: app['updated-at-round']
    };

    res.json(result);

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

    if (!indexerClient) {
      return res.status(503).json({
        error: 'Indexer not available',
        message: 'Algorand indexer client not initialized'
      });
    }

    const transactions = await indexerClient
      .searchForTransactions()
      .applicationID(appId)
      .limit(limit)
      .do();
    
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

    try {
      const publicKeyBytes = Buffer.from(public_key, 'hex');
      const messageBytes = Buffer.from(message, 'utf8');
      const signatureBytes = Buffer.from(signature, 'hex');
      
      const isValid = tweetnacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );

      res.json({
        valid: isValid,
        message,
        signature,
        public_key
      });
    } catch (error) {
      res.json({
        valid: false,
        message,
        signature,
        public_key
      });
    }

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
    public_key: verifier.getPublicKeyHex(),
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
  logger.info(`Verifier Public Key: ${verifier.getPublicKeyHex()}`);
  logger.info(`Algod Address: ${ALGOD_ADDRESS}`);
  logger.info(`Indexer Address: ${INDEXER_ADDRESS}`);
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
