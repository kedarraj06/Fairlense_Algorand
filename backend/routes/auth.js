// backend/routes/auth.js
// Authentication routes for FairLens

const express = require('express');
const { body, validationResult } = require('express-validator');
const { 
  login, 
  register, 
  authenticate, 
  ROLES 
} = require('../middleware/auth');
const { generalRateLimit, validateInput } = require('../middleware/security');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(generalRateLimit);

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('role')
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
  body('walletAddress')
    .optional()
    .matches(/^[A-Z2-7]{58}$/)
    .withMessage('Invalid Algorand wallet address format')
];

// POST /auth/register
router.post('/register', registerValidation, validateInput, async (req, res) => {
  try {
    const { email, password, role, walletAddress } = req.body;
    
    const result = await register({
      email,
      password,
      role,
      walletAddress
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(400).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// POST /auth/login
router.post('/login', loginValidation, validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await login(email, password);

    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(401).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// GET /auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: req.user
  });
});

// POST /auth/logout
router.post('/logout', authenticate, (req, res) => {
  // In a real application, you would invalidate the token
  // For now, we'll just return a success message
  res.json({
    message: 'Logout successful'
  });
});

// POST /auth/refresh
router.post('/refresh', authenticate, (req, res) => {
  // Generate a new token
  const { generateToken } = require('../middleware/auth');
  const newToken = generateToken(req.user);
  
  res.json({
    message: 'Token refreshed successfully',
    token: newToken
  });
});

// GET /auth/roles
router.get('/roles', (req, res) => {
  res.json({
    roles: ROLES,
    description: {
      [ROLES.ADMIN]: 'Full system access',
      [ROLES.GOVERNMENT]: 'Government/owner role - can create contracts and manage milestones',
      [ROLES.CONTRACTOR]: 'Contractor role - can submit proofs and view assigned contracts',
      [ROLES.VERIFIER]: 'Verifier role - can create attestations for milestone verification',
      [ROLES.VIEWER]: 'View-only access to public contract information'
    }
  });
});

module.exports = router;
