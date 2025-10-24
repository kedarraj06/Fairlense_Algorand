// FairLens Backend Server
// Construction Tender Management Platform with Algorand Blockchain Integration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// const { createClient } = require('@supabase/supabase-js');
const algosdk = require('algosdk');
const winston = require('winston');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { Server } = require('socket.io');
const http = require('http');
const cron = require('node-cron');

require('dotenv').config();

// Initialize MongoDB
const connectDB = require('./config/mongodb');
const MongoDBService = require('./services/MongoDBService');
const BlockchainService = require('./services/BlockchainService');

const mongoService = new MongoDBService();
const blockchainService = new BlockchainService();

// Connect to MongoDB
connectDB();

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



// Algorand clients are initialized in BlockchainService

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

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

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'connected',
      blockchain: 'connected',
      notifications: 'active'
    }
  });
});

// Authentication Routes
app.post('/api/auth/register', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['government', 'contractor', 'citizen']).withMessage('Valid role required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('walletAddress').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, name, walletAddress } = req.body;

    // Check if user already exists
    const existingUserResult = await mongoService.getUserByEmail(email);
    if (existingUserResult.success && existingUserResult.user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await mongoService.createUser({
      email,
      password: hashedPassword,
      role,
      name,
      wallet_address: walletAddress,
      created_at: new Date()
    });

    if (!userResult.success) {
      return res.status(500).json({ error: 'Failed to create user: ' + userResult.error });
    }

    const user = userResult.user;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        walletAddress: user.wallet_address
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Get user from database
    const userResult = await mongoService.getUserByEmail(email);
    
    if (!userResult.success || !userResult.user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResult.user;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        walletAddress: user.wallet_address
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tender Management Routes
app.get('/api/tenders', async (req, res) => {
  try {
    const tendersResult = await mongoService.getTenders();
    
    if (!tendersResult.success) {
      logger.error('Database error:', tendersResult.error);
      return res.status(500).json({ error: 'Failed to fetch tenders' });
    }

    res.json({ tenders: tendersResult.tenders });
  } catch (error) {
    logger.error('Error fetching tenders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tenders', authenticateToken, authorizeRole(['government']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
  body('deadline').isISO8601().withMessage('Valid deadline required'),
  body('requirements').isArray().withMessage('Requirements must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, budget, deadline, requirements, milestones } = req.body;

    // Create tender
    const tenderResult = await mongoService.createTender({
      title,
      description,
      budget,
      deadline,
      requirements,
      milestones,
      government: req.user.userId,
      status: 'open',
      created_at: new Date()
    });

    if (!tenderResult.success) {
      logger.error('Database error:', tenderResult.error);
      return res.status(500).json({ error: 'Failed to create tender' });
    }
    
    const tender = tenderResult.tender;

    // Emit real-time update
    io.emit('tender_created', tender);

    res.json({ message: 'Tender created successfully', tender });
  } catch (error) {
    logger.error('Error creating tender:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Project Management Routes
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projectsResult = await mongoService.getProjects();
    
    if (!projectsResult.success) {
      logger.error('Database error:', projectsResult.error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Filter by user role
    let filteredProjects = projectsResult.projects;
    if (req.user.role === 'contractor') {
      filteredProjects = filteredProjects.filter(project => project.contractor && project.contractor.toString() === req.user.userId);
    } else if (req.user.role === 'government') {
      filteredProjects = filteredProjects.filter(project => project.government && project.government.toString() === req.user.userId);
    }

    res.json({ projects: filteredProjects });
  } catch (error) {
    logger.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Blockchain Integration Routes
app.post('/api/blockchain/deploy-contract', authenticateToken, authorizeRole(['government']), async (req, res) => {
  try {
    const { tenderId, contractorWallet } = req.body;
    
    // Get tender from database
    const tenderResult = await mongoService.getTenderById(tenderId);
    if (!tenderResult.success || !tenderResult.tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    
    const tender = tenderResult.tender;
    
    // Get deployer mnemonic from environment
    const deployerMnemonic = process.env.DEPLOYER_MNEMONIC;
    if (!deployerMnemonic) {
      return res.status(500).json({ error: 'Deployer mnemonic not configured' });
    }
    
    // Get verifier public key from environment
    const verifierPubkeyHex = process.env.VERIFIER_PUBKEY;
    if (!verifierPubkeyHex) {
      return res.status(500).json({ error: 'Verifier public key not configured' });
    }
    
    const verifierPubkey = Buffer.from(verifierPubkeyHex, 'hex');
    
    // Deploy contract
    const deployResult = await blockchainService.deployContract(
      deployerMnemonic,
      req.user.userId, // owner address
      contractorWallet || tender.contractor || req.user.userId, // contractor address
      verifierPubkey
    );
    
    if (!deployResult.success) {
      logger.error('Contract deployment failed:', deployResult.error);
      return res.status(500).json({ error: 'Failed to deploy contract: ' + deployResult.error });
    }
    
    // Update tender with contract address
    const updateResult = await mongoService.updateTender(tenderId, {
      contractAddress: deployResult.appAddress,
      blockchainDeployed: true
    });
    
    if (!updateResult.success) {
      logger.error('Failed to update tender:', updateResult.error);
      // Note: Contract was deployed but tender wasn't updated
      return res.status(500).json({ 
        error: 'Contract deployed but failed to update tender: ' + updateResult.error,
        contractAddress: deployResult.appAddress,
        appId: deployResult.appId
      });
    }
    
    // Emit real-time update
    io.emit('contract_deployed', {
      tenderId,
      contractAddress: deployResult.appAddress,
      appId: deployResult.appId
    });
    
    res.json({
      message: 'Smart contract deployed successfully',
      contractAddress: deployResult.appAddress,
      appId: deployResult.appId,
      txId: deployResult.txId
    });
  } catch (error) {
    logger.error('Error deploying contract:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blockchain/add-milestone', authenticateToken, authorizeRole(['government']), async (req, res) => {
  try {
    const { tenderId, index, amount, dueDate, ipfsHash } = req.body;
    
    // Get tender from database
    const tenderResult = await mongoService.getTenderById(tenderId);
    if (!tenderResult.success || !tenderResult.tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    
    const tender = tenderResult.tender;
    
    if (!tender.contractAddress || !tender.blockchainDeployed) {
      return res.status(400).json({ error: 'Smart contract not deployed for this tender' });
    }
    
    // Get deployer mnemonic from environment
    const deployerMnemonic = process.env.DEPLOYER_MNEMONIC;
    if (!deployerMnemonic) {
      return res.status(500).json({ error: 'Deployer mnemonic not configured' });
    }
    
    // Add milestone to contract
    const addMilestoneResult = await blockchainService.addMilestone(
      deployerMnemonic,
      parseInt(tender.appId), // Extract appId from contract address or store separately
      index,
      amount,
      dueDate,
      ipfsHash
    );
    
    if (!addMilestoneResult.success) {
      logger.error('Add milestone failed:', addMilestoneResult.error);
      return res.status(500).json({ error: 'Failed to add milestone: ' + addMilestoneResult.error });
    }
    
    // Update tender milestone in database
    const updatedMilestones = [...(tender.milestones || [])];
    updatedMilestones[index] = {
      title: `Milestone ${index}`,
      description: `Milestone ${index} description`,
      amount,
      dueDate,
      status: 'pending'
    };
    
    const updateResult = await mongoService.updateTender(tenderId, {
      milestones: updatedMilestones
    });
    
    if (!updateResult.success) {
      logger.error('Failed to update tender milestones:', updateResult.error);
    }
    
    // Emit real-time update
    io.emit('milestone_added', {
      tenderId,
      index,
      amount,
      dueDate
    });
    
    res.json({
      message: 'Milestone added successfully',
      txId: addMilestoneResult.txId
    });
  } catch (error) {
    logger.error('Error adding milestone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blockchain/submit-proof', authenticateToken, authorizeRole(['contractor']), async (req, res) => {
  try {
    const { tenderId, index, proofHash } = req.body;
    
    // Get tender from database
    const tenderResult = await mongoService.getTenderById(tenderId);
    if (!tenderResult.success || !tenderResult.tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    
    const tender = tenderResult.tender;
    
    if (!tender.contractAddress || !tender.blockchainDeployed) {
      return res.status(400).json({ error: 'Smart contract not deployed for this tender' });
    }
    
    // Get contractor mnemonic from environment or user (in production, this would come from user's wallet)
    const contractorMnemonic = process.env.CONTRACTOR_MNEMONIC || process.env.DEPLOYER_MNEMONIC;
    if (!contractorMnemonic) {
      return res.status(500).json({ error: 'Contractor mnemonic not configured' });
    }
    
    // Submit proof to contract
    const submitProofResult = await blockchainService.submitProof(
      contractorMnemonic,
      parseInt(tender.appId),
      index,
      proofHash
    );
    
    if (!submitProofResult.success) {
      logger.error('Submit proof failed:', submitProofResult.error);
      return res.status(500).json({ error: 'Failed to submit proof: ' + submitProofResult.error });
    }
    
    // Update tender milestone status in database
    const updatedMilestones = [...(tender.milestones || [])];
    if (updatedMilestones[index]) {
      updatedMilestones[index].status = 'submitted';
      updatedMilestones[index].submissionDate = new Date();
    }
    
    const updateResult = await mongoService.updateTender(tenderId, {
      milestones: updatedMilestones
    });
    
    if (!updateResult.success) {
      logger.error('Failed to update tender milestones:', updateResult.error);
    }
    
    // Emit real-time update
    io.emit('proof_submitted', {
      tenderId,
      index,
      proofHash
    });
    
    res.json({
      message: 'Proof submitted successfully',
      txId: submitProofResult.txId
    });
  } catch (error) {
    logger.error('Error submitting proof:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/blockchain/verify-milestone', authenticateToken, authorizeRole(['government']), async (req, res) => {
  try {
    const { tenderId, index, message, signature } = req.body;
    
    // Get tender from database
    const tenderResult = await mongoService.getTenderById(tenderId);
    if (!tenderResult.success || !tenderResult.tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    
    const tender = tenderResult.tender;
    
    if (!tender.contractAddress || !tender.blockchainDeployed) {
      return res.status(400).json({ error: 'Smart contract not deployed for this tender' });
    }
    
    // Get verifier private key from environment
    const verifierPrivateKeyHex = process.env.VERIFIER_PRIVATE_KEY;
    if (!verifierPrivateKeyHex) {
      return res.status(500).json({ error: 'Verifier private key not configured' });
    }
    
    const verifierPrivateKey = Buffer.from(verifierPrivateKeyHex, 'hex');
    
    // Verify and release payment
    const verifyResult = await blockchainService.verifyAndRelease(
      verifierPrivateKey,
      parseInt(tender.appId),
      index,
      message,
      Buffer.from(signature, 'hex')
    );
    
    if (!verifyResult.success) {
      logger.error('Verify and release failed:', verifyResult.error);
      return res.status(500).json({ error: 'Failed to verify and release: ' + verifyResult.error });
    }
    
    // Update tender milestone status in database
    const updatedMilestones = [...(tender.milestones || [])];
    if (updatedMilestones[index]) {
      updatedMilestones[index].status = 'paid';
      updatedMilestones[index].paymentDate = new Date();
    }
    
    const updateResult = await mongoService.updateTender(tenderId, {
      milestones: updatedMilestones
    });
    
    if (!updateResult.success) {
      logger.error('Failed to update tender milestones:', updateResult.error);
    }
    
    // Emit real-time update
    io.emit('milestone_verified', {
      tenderId,
      index,
      message
    });
    
    res.json({
      message: 'Milestone verified and payment released',
      txId: verifyResult.txId
    });
  } catch (error) {
    logger.error('Error verifying milestone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/blockchain/contract/:contractAddress/state', async (req, res) => {
  try {
    const { contractAddress } = req.params;
    
    // In a real implementation, you would extract appId from contractAddress
    // For now, we'll assume it's stored in the tender
    
    // Get application state
    const stateResult = await blockchainService.getApplicationState(contractAddress);
    
    if (!stateResult.success) {
      logger.error('Get contract state failed:', stateResult.error);
      return res.status(500).json({ error: 'Failed to get contract state: ' + stateResult.error });
    }
    
    res.json({
      state: stateResult
    });
  } catch (error) {
    logger.error('Error getting contract state:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Blockchain Integration Routes
app.post('/api/blockchain/deploy-contract', authenticateToken, authorizeRole(['government']), async (req, res) => {
  try {
    const { tenderId, contractorWallet, verifierWallet } = req.body;

    // Get tender details
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', tenderId)
      .single();

    if (tenderError || !tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Deploy smart contract (simplified for demo)
    const contractAddress = `CONTRACT_${uuidv4()}`;
    
    // Update tender with contract address
    const { error: updateError } = await supabase
      .from('tenders')
      .update({ 
        contract_address: contractAddress,
        blockchain_deployed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', tenderId);

    if (updateError) {
      logger.error('Database error:', updateError);
      return res.status(500).json({ error: 'Failed to update tender' });
    }

    res.json({
      message: 'Smart contract deployed successfully',
      contractAddress,
      tenderId
    });

  } catch (error) {
    logger.error('Error deploying contract:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics Routes
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const { data: tenders } = await supabase
      .from('tenders')
      .select('status, budget');

    const { data: projects } = await supabase
      .from('projects')
      .select('status, budget');

    const analytics = {
      totalTenders: tenders?.length || 0,
      totalProjects: projects?.length || 0,
      totalBudget: tenders?.reduce((sum, t) => sum + (t.budget || 0), 0) || 0,
      activeProjects: projects?.filter(p => p.status === 'active').length || 0,
      completedProjects: projects?.filter(p => p.status === 'completed').length || 0
    };

    res.json({ analytics });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File Upload Routes
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In a real implementation, you would upload to a cloud storage service
    const fileUrl = `https://storage.example.com/files/${uuidv4()}-${req.file.originalname}`;

    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('Client connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    logger.info(`Client ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected:', socket.id);
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
server.listen(PORT, () => {
  logger.info(`FairLens Backend Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Supabase URL: ${process.env.SUPABASE_URL || 'Not configured'}`);
  logger.info(`Algod Address: ${process.env.ALGOD_ADDRESS || 'testnet'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = app;