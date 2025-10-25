# FairLens - Transparent Government Tenders on Algorand

![FairLens Logo](https://img.shields.io/badge/FairLens-Transparent%20Government%20Tenders-blue)
![Algorand](https://img.shields.io/badge/Built%20on-Algorand-gold)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Overview

FairLens is a revolutionary blockchain-powered platform that brings transparency and trust to government tender management. Built on the Algorand blockchain, it enables milestone-based payments with AI-powered verification, ensuring fair and transparent government contracting processes.

### 🎯 Key Features

- **🔗 Blockchain Integration**: Built on Algorand for fast, secure, and low-cost transactions
- **📱 Pera Wallet Support**: Seamless mobile wallet integration with QR code scanning
- **🤖 AI Verification**: Off-chain AI verification with on-chain attestations
- **💰 Automated Payments**: Smart contract-based milestone payments
- **👥 Multi-Role Support**: Government, Contractor, Verifier, and Viewer roles
- **📊 Real-time Monitoring**: Live contract state and transaction tracking
- **🔒 Enterprise Security**: JWT authentication, rate limiting, and input validation
- **📱 Modern UI/UX**: Beautiful, responsive design with dark mode support

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Smart         │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Contract      │
│                 │    │                 │    │   (PyTeal)      │
│ • Pera Wallet   │    │ • Attestation   │    │                 │
│ • Dashboard     │    │   API           │    │ • Milestone     │
│ • Management    │    │ • Indexer       │    │   Management    │
│   Interface     │    │   Integration   │    │ • Payment       │
└─────────────────┘    └─────────────────┘    │   Automation    │
                                               └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │   Algorand      │
                                               │   Blockchain    │
                                               │                 │
                                               │ • TestNet       │
                                               │ • MainNet       │
                                               └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.9+
- **Git**
- **Pera Algorand Wallet** (mobile app)

### 1. Clone the Repository

```bash
git clone https://github.com/Kaustubh2512/fairlens.git
cd fairlens
```

### 2. Environment Setup

```bash
# Copy environment files
cp env.example .env

# Edit configuration (see Environment Variables section)
nano .env
```

### 3. Install Dependencies

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

### 4. Start the Application

#### Start Backend Server
```bash
cd backend
node server.js
```
*Server runs on http://localhost:5000*

#### Start Frontend (in new terminal)
```bash
cd frontend
npm run dev 
```
*Frontend runs on http://localhost:3000*

### 5. Deploy Smart Contract

```bash
python scripts/deploy_testnet.py
```

Follow the prompts to enter:
- Owner address (your wallet address)
- Contractor address
- Verifier public key

## 📱 Pera Wallet Setup

### 1. Install Pera Wallet
- Download from [App Store](https://apps.apple.com/app/pera-algo-wallet/id1459898525) or [Google Play](https://play.google.com/store/apps/details?id=com.algorand.android)
- Create a new wallet or import existing one
- Switch to **TestNet** for development

### 2. Get TestNet ALGOs
- Visit [Algorand TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
- Enter your wallet address
- Request 10 test ALGOs

### 3. Connect to FairLens
- Open FairLens in your browser
- Click "Connect Pera Wallet"
- Scan the QR code with your Pera wallet
- Approve the connection

## 🔧 Environment Variables

### Backend (.env)
```bash
# Algorand Configuration
ALGOD_TOKEN=
ALGOD_ADDRESS=https://testnet-api.4160.nodely.dev
INDEXER_TOKEN=
INDEXER_ADDRESS=https://testnet-idx.4160.nodely.dev

# Security
JWT_SECRET=your_jwt_secret_here
VERIFIER_PRIVATE_KEY=your_verifier_private_key_here

# Server
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```bash
REACT_APP_ALGOD_TOKEN=
REACT_APP_ALGOD_ADDRESS=https://testnet-api.4160.nodely.dev
REACT_APP_INDEXER_TOKEN=
REACT_APP_INDEXER_ADDRESS=https://testnet-idx.4160.nodely.dev
REACT_APP_BACKEND_URL=http://localhost:5000
```

## 👥 User Roles

### 🏛️ Government/Owner
- Create and deploy smart contracts
- Add milestones to contracts
- Fund contract escrow accounts
- Monitor contractor progress
- Release payments upon verification

### 🏗️ Contractor
- Submit proof of work completion
- Track milestone progress
- Monitor payment status
- View assigned contracts

### 🔍 Verifier (AI/Inspector)
- Review submitted proofs
- Create attestations for milestone completion
- Verify work quality and compliance
- Access verification tools

### 👁️ Viewer
- Monitor public contract information
- Track transparency metrics
- Access public reports

## 📋 Usage Guide

### 1. Create a Contract (Government Role)

```bash
# Deploy smart contract
python scripts/deploy_testnet.py

# Enter your details:
# - Owner address: Your wallet address
# - Contractor address: Contractor's wallet
# - Verifier public key: AI verifier's public key
```

### 2. Add Milestones

1. Open FairLens frontend
2. Enter the contract ID
3. Select "Government" role
4. Click "Add Milestone"
5. Enter milestone details:
   - Index (starting from 0)
   - Amount (in microALGOs)
   - Due date
   - Description

### 3. Submit Proof (Contractor Role)

1. Connect your Pera wallet
2. Select "Contractor" role
3. Enter milestone index
4. Upload proof hash or IPFS hash
5. Click "Submit Proof"
6. Sign transaction in Pera wallet

### 4. Verify and Release Payment (Verifier Role)

1. Review submitted proof
2. Create attestation:
   - Select status (PASS/FAIL/PENDING)
   - Enter milestone hash
   - Add proof hash
3. Click "Create Attestation"
4. Payment is automatically released if status is PASS

## 🧪 Testing

### Run All Tests
```bash
# Run all tests
python tests/run_all_tests.py

# Backend API tests
python tests/test_backend_api.py

# Smart contract unit tests
python tests/test_contract_unit.py
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Create attestation (example)
curl -X POST http://localhost:5000/api/attest \
  -H "Content-Type: application/json" \
  -d '{"app_id": 123, "milestone_index": 0, "status": "PASS", "milestone_hash": "test123"}'
```

## 🚀 Deployment

### Development
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Production
```bash
# Build and deploy
./deploy.sh

# Health check
curl http://localhost:5000/health
```

## 📊 Monitoring

### Access Monitoring Dashboards
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Application**: http://localhost:3000

### Key Metrics
- Request rate and response time
- Error rates and types
- Blockchain transaction success rate
- User activity and engagement

## 🔒 Security Features

- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Configured for production domains
- **Ed25519 Signatures**: Cryptographic verification
- **HTTPS Support**: SSL/TLS encryption

## 🛠️ Development

### Project Structure
```
fairlens/
├── backend/                 # Node.js API server
│   ├── services/           # Business logic services
│   ├── routes/             # API routes
│   ├── middleware/         # Security and auth middleware
│   └── tests/              # Backend tests
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   └── hooks/          # Custom hooks
│   └── public/             # Static assets
├── contracts/              # PyTeal smart contracts
├── scripts/                # Deployment scripts
├── tests/                  # Integration tests
├── docs/                   # Documentation
└── monitoring/             # Monitoring configs
```

### Adding New Features

1. **Backend API**:
   - Add routes in `backend/routes/`
   - Implement services in `backend/services/`
   - Add tests in `backend/tests/`

2. **Frontend Components**:
   - Create components in `frontend/src/components/`
   - Add services in `frontend/src/services/`
   - Update context in `frontend/src/context/`

3. **Smart Contracts**:
   - Modify contracts in `contracts/`
   - Update deployment scripts in `scripts/`
   - Add tests in `tests/`

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run tests**:
   ```bash
   npm test
   ```
6. **Commit your changes**:
   ```bash
   git commit -m "Add your feature"
   ```
7. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Code Standards

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **JSDoc**: Documentation
- **TypeScript**: Type safety (future)

## 📚 Documentation

- [User Guide](docs/USER_GUIDE.md) - Complete user manual
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Technical documentation
- [API Documentation](backend/README.md) - Backend API reference
- [Smart Contract Guide](contracts/README.md) - Contract documentation

## 🆘 Troubleshooting

### Common Issues

#### Wallet Connection Problems
- Ensure Pera wallet is installed and updated
- Check that you're on TestNet
- Clear browser cache and try again
- Verify network connectivity

#### Transaction Failures
- Check wallet balance (need ALGOs for fees)
- Ensure sufficient escrow funding
- Verify contract ID is correct
- Check network status

#### Backend Server Issues
- Check if port 5000 is available
- Verify environment variables
- Check logs in `backend/logs/`
- Restart the server

### Getting Help

- **Documentation**: Check the docs folder
- **Issues**: Create a GitHub issue
- **Email**: support@fairlens.org

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algorand Foundation** for blockchain infrastructure
- **Pera Wallet** for mobile wallet integration
- **Open Source Community** for various libraries and tools

## 📞 Contact

- **Repository**: https://github.com/Kaustubh2512/fairlens
- **Email**: ksandure@gmail.com

---

**Built with ❤️ for transparent government contracting**

*Last updated: October 2025*