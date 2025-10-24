# FairLens Production Deployment Guide

This guide provides step-by-step instructions for deploying the FairLens platform in a production environment with all integrations working properly.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Algorand)    │
│                 │    │                 │    │                 │
│ • Pera Wallet   │    │ • MongoDB       │    │ • Smart         │
│ • Dashboard     │    │ • API Server    │    │   Contract      │
│ • Management    │    │ • Auth System   │    │ • Milestone     │
└─────────────────┘    │ • Blockchain    │    │   Payments      │
                       │   Integration   │    │                 │
                       └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Database      │
                       │   (MongoDB)     │
                       └─────────────────┘
```

## Prerequisites

1. **Node.js** 18+
2. **Python** 3.9+
3. **MongoDB** 4.4+
4. **Git**
5. **Pera Algorand Wallet** (mobile app)
6. **Algorand TestNet/MainNet account with ALGOs**

## 1. Environment Setup

### Install Dependencies

```bash
# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..

# Python dependencies (for smart contracts)
pip install -r backend/requirements.txt
```

### Configure Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend (.env):**
```bash
# Server Configuration
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fairlens

# Algorand TestNet Configuration
ALGOD_TOKEN=
ALGOD_ADDRESS=https://testnet-api.4160.nodely.dev
ALGOD_PORT=443

INDEXER_TOKEN=
INDEXER_ADDRESS=https://testnet-idx.4160.nodely.dev
INDEXER_PORT=443

# Deployment Configuration
DEPLOYER_MNEMONIC=your_deployer_mnemonic_here
OWNER_ADDRESS=your_owner_wallet_address
CONTRACTOR_ADDRESS=your_contractor_wallet_address
VERIFIER_PRIVATE_KEY=your_verifier_private_key_hex
VERIFIER_PUBKEY=your_verifier_public_key_hex
```

**Frontend (.env):**
```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_BACKEND_URL=http://localhost:5000

# Algorand Configuration
REACT_APP_ALGOD_TOKEN=
REACT_APP_ALGOD_ADDRESS=https://testnet-api.4160.nodely.dev
REACT_APP_INDEXER_TOKEN=
REACT_APP_INDEXER_ADDRESS=https://testnet-idx.4160.nodely.dev
```

## 2. Database Setup

### Start MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongod
# or on Windows
net start MongoDB
```

### Initialize Database

```bash
cd scripts
node init-mongodb.js
```

## 3. Smart Contract Deployment

### Deploy Smart Contract

```bash
cd scripts
node deploy-contract.js
```

This will create a `contract-deployment.json` file with the deployed contract information.

## 4. Start Services

### Start Backend Server

```bash
cd backend
node server.js
```

### Start Frontend Application

```bash
cd frontend
npm start
```

## 5. Wallet Integration

### Pera Wallet Setup

1. Install Pera Wallet from [App Store](https://apps.apple.com/app/pera-algo-wallet/id1459898525) or [Google Play](https://play.google.com/store/apps/details?id=com.algorand.android)
2. Create a new wallet or import existing one
3. Switch to **TestNet** for development

### Connect Wallet in Application

1. Open FairLens in your browser
2. Click "Connect Pera Wallet"
3. Scan the QR code with your Pera wallet
4. Approve the connection

## 6. User Roles and Permissions

### Government/Owner
- Create and deploy smart contracts
- Add milestones to contracts
- Fund contract escrow accounts
- Monitor contractor progress
- Release payments upon verification

### Contractor
- Submit proof of work completion
- Track milestone progress
- Monitor payment status
- View assigned contracts

### Citizen
- Monitor public contract information
- Track transparency metrics
- Access public reports

## 7. API Endpoints

### Authentication
```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
GET  /api/auth/me          - Get current user
POST /api/auth/logout      - User logout
```

### Tenders
```
GET  /api/tenders           - Get all tenders
POST /api/tenders           - Create new tender
GET  /api/tenders/:id      - Get tender by ID
PUT  /api/tenders/:id      - Update tender
DELETE /api/tenders/:id    - Delete tender
```

### Projects
```
GET  /api/projects          - Get all projects
POST /api/projects          - Create new project
GET  /api/projects/:id     - Get project by ID
PUT  /api/projects/:id     - Update project
```

### Blockchain Integration
```
POST /api/blockchain/deploy-contract    - Deploy smart contract
POST /api/blockchain/add-milestone      - Add milestone to contract
POST /api/blockchain/submit-proof       - Submit milestone proof
POST /api/blockchain/verify-milestone   - Verify and release payment
GET  /api/blockchain/contract/:address/state - Get contract state
```

## 8. Smart Contract Functions

### Core Functions

1. **add_ms** - Add milestone
   - Parameters: index, amount, due_date, ipfs_hash
   - Permission: Owner only

2. **submit_proof** - Submit milestone proof
   - Parameters: index, proof_hash
   - Permission: Contractor only

3. **verify_release** - Verify and release payment
   - Parameters: index, message, signature
   - Permission: Anyone with valid attestation

4. **set_verifier** - Change verifier public key
   - Parameters: new_verifier_pubkey
   - Permission: Owner only

5. **set_contractor** - Change contractor address
   - Parameters: new_contractor_address
   - Permission: Owner only

## 9. Production Considerations

### Security
- Use strong JWT secrets
- Implement rate limiting
- Use HTTPS in production
- Validate all user inputs
- Sanitize database queries

### Performance
- Use database indexing
- Implement caching where appropriate
- Optimize database queries
- Use connection pooling

### Monitoring
- Set up logging
- Implement health checks
- Monitor blockchain transactions
- Track API performance

### Backup and Recovery
- Regular database backups
- Contract state monitoring
- Transaction logging
- Disaster recovery plan

## 10. Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string in .env
   - Ensure MongoDB is running on correct port

2. **Algorand API Errors**
   - Check network connectivity
   - Verify API endpoints in .env
   - Ensure sufficient ALGO balance

3. **Wallet Connection Issues**
   - Ensure Pera Wallet is installed
   - Check network (TestNet/MainNet)
   - Verify wallet permissions

### Support

For issues not covered in this guide, please:
1. Check the application logs
2. Verify all environment variables
3. Ensure all services are running
4. Contact support with error details

## 11. Testing

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
cd tests
python run_all_tests.py
```

### End-to-End Tests
Manual testing of all user flows:
- User registration and login
- Tender creation and management
- Smart contract deployment
- Milestone workflow
- Payment processing
- Wallet integration

This deployment guide ensures a fully functional, production-ready FairLens platform with all integrations working properly.