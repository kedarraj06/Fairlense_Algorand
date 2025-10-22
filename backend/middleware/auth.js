// backend/middleware/auth.js
// Authentication and authorization middleware for FairLens

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock user database (in production, use a real database)
const users = new Map();

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// User roles
const ROLES = {
  ADMIN: 'admin',
  GOVERNMENT: 'government',
  CONTRACTOR: 'contractor',
  VERIFIER: 'verifier',
  VIEWER: 'viewer'
};

// Permissions for each role
const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'], // All permissions
  [ROLES.GOVERNMENT]: [
    'contract:create',
    'contract:read',
    'contract:update',
    'milestone:create',
    'milestone:read',
    'milestone:update',
    'payment:release',
    'attestation:read'
  ],
  [ROLES.CONTRACTOR]: [
    'contract:read',
    'milestone:read',
    'milestone:submit_proof',
    'payment:read'
  ],
  [ROLES.VERIFIER]: [
    'contract:read',
    'milestone:read',
    'attestation:create',
    'attestation:read'
  ],
  [ROLES.VIEWER]: [
    'contract:read',
    'milestone:read',
    'attestation:read'
  ]
};

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Authorization middleware
const authorize = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    const userPermissions = PERMISSIONS[userRole] || [];

    // Check if user has permission
    if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Required: ${permission}`
      });
    }

    next();
  };
};

// Role-based authorization
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Required role: ${roleArray.join(' or ')}`
      });
    }

    next();
  };
};

// Wallet address validation
const validateWalletAddress = (req, res, next) => {
  if (!req.user || !req.user.walletAddress) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Wallet address not associated with user account'
    });
  }

  // Validate Algorand address format
  const address = req.user.walletAddress;
  if (!/^[A-Z2-7]{58}$/.test(address)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid Algorand wallet address format'
    });
  }

  next();
};

// User management functions
const createUser = async (userData) => {
  const { email, password, role, walletAddress } = userData;
  
  // Check if user already exists
  if (users.has(email)) {
    throw new Error('User already exists');
  }

  // Validate role
  if (!Object.values(ROLES).includes(role)) {
    throw new Error('Invalid role');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = {
    id: Date.now().toString(),
    email,
    password: hashedPassword,
    role,
    walletAddress,
    createdAt: new Date().toISOString(),
    isActive: true
  };

  users.set(email, user);
  return user;
};

const getUserByEmail = (email) => {
  return users.get(email);
};

const getUserById = (id) => {
  for (const user of users.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
};

const updateUser = (email, updates) => {
  const user = users.get(email);
  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
  users.set(email, updatedUser);
  return updatedUser;
};

const deleteUser = (email) => {
  return users.delete(email);
};

// Login function
const login = async (email, password) => {
  const user = getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);
  
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress
    },
    token
  };
};

// Register function
const register = async (userData) => {
  const user = await createUser(userData);
  const token = generateToken(user);
  
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress
    },
    token
  };
};

module.exports = {
  ROLES,
  PERMISSIONS,
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticate,
  optionalAuth,
  authorize,
  requireRole,
  validateWalletAddress,
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
  login,
  register
};
