# FairLens Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Smart Contracts](#smart-contracts)
4. [Backend API](#backend-api)
5. [Frontend Development](#frontend-development)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Contributing](#contributing)

## Architecture Overview

FairLens is built with a modern, scalable architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Smart         │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Contract      │
│                 │    │                 │    │   (PyTeal)       │
│ • Wallet Connect│    │ • Attestation   │    │                 │
│ • Dashboard     │    │   API           │    │ • Milestone     │
│ • Management    │    │ • Indexer       │    │   Management    │
│   Interface     │    │   Integration   │    │ • Payment      │
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

### Key Components

- **Frontend**: React application with modern UI/UX
- **Backend**: Node.js API with Express framework
- **Smart Contracts**: PyTeal contracts on Algorand
- **Database**: PostgreSQL for application data
- **Cache**: Redis for session management
- **Storage**: IPFS for metadata storage
- **Monitoring**: Prometheus + Grafana

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Git

### 1. Clone Repository

```bash
git clone https://github.com/your-org/fairlens.git
cd fairlens
```

### 2. Environment Setup

```bash
# Copy environment files
cp env.example .env
cp env.production.example .env.production

# Edit configuration
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

# Python dependencies
pip install pyteal==0.20.0 pytest
```

### 4. Start Development Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individual services
cd backend && npm run dev &
cd frontend && npm start
```

### 5. Deploy Smart Contract

```bash
# Deploy to TestNet
python scripts/deploy_testnet.py
```

## Smart Contracts

### Contract Structure

The FairLens smart contract is written in PyTeal and includes:

- **Global State**: Owner, contractor, verifier, milestones
- **Methods**: Add milestone, submit proof, verify release
- **Security**: Ed25519 signature verification
- **Payments**: Inner transactions for automatic payments

### Key Files

- `contracts/fairlens_app.py` - Main smart contract
- `scripts/deploy_testnet.py` - Deployment script
- `tests/test_contract_unit.py` - Contract tests

### Contract Methods

```python
# Add milestone (owner only)
add_ms(index, amount, due_timestamp, ipfs_hash)

# Submit proof (contractor only)
submit_proof(index, proof_hash)

# Verify and release payment (anyone with valid attestation)
verify_release(index, message, signature)

# Admin functions
set_verifier(new_verifier_pubkey)
set_contractor(new_contractor_address)
```

### Testing Contracts

```bash
# Run contract tests
python -m pytest tests/test_contract_unit.py -v

# Test deployment
python scripts/test_contract.py
```

## Backend API

### Architecture

The backend is built with Node.js and Express:

- **Framework**: Express.js
- **Authentication**: JWT with role-based access
- **Validation**: express-validator
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston
- **Database**: PostgreSQL with connection pooling

### API Endpoints

#### Authentication
```
POST /auth/register     - Register new user
POST /auth/login        - User login
GET  /auth/me          - Get current user
POST /auth/logout      - User logout
```

#### Attestations
```
POST /api/attest              - Create attestation
POST /api/verify-attestation  - Verify attestation
GET  /api/verifier/public-key - Get verifier public key
```

#### Contracts
```
GET /api/app/:id/state        - Get contract state
GET /api/app/:id/transactions - Get contract transactions
```

#### Health
```
GET /health - Health check
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    wallet_address VARCHAR(58),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    app_id INTEGER UNIQUE NOT NULL,
    owner_address VARCHAR(58) NOT NULL,
    contractor_address VARCHAR(58) NOT NULL,
    verifier_pubkey VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attestations table
CREATE TABLE attestations (
    id SERIAL PRIMARY KEY,
    app_id INTEGER NOT NULL,
    milestone_index INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    signature VARCHAR(128) NOT NULL,
    verifier_pubkey VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Run security audit
npm audit
```

## Frontend Development

### Architecture

The frontend is built with React and modern tools:

- **Framework**: React 18
- **Styling**: CSS with CSS Variables
- **State Management**: React Context
- **HTTP Client**: Fetch API
- **Notifications**: react-hot-toast
- **Icons**: Material Icons

### Project Structure

```
frontend/src/
├── components/          # Reusable components
│   ├── WalletConnector.jsx
│   ├── ContractDashboard.jsx
│   ├── MilestoneManager.jsx
│   ├── UserAuth.jsx
│   └── UserProfile.jsx
├── context/            # React Context
│   └── AppContext.js
├── services/           # API services
│   └── AlgorandService.js
├── __tests__/          # Test files
├── App.jsx            # Main app component
├── App.css            # Global styles
└── index.js           # Entry point
```

### Key Components

#### WalletConnector
Handles wallet connection with AlgoSigner and WalletConnect support.

#### ContractDashboard
Displays contract state, milestones, and transaction history.

#### MilestoneManager
Manages milestone creation, proof submission, and attestation.

#### UserAuth
Handles user authentication and registration.

### Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint
```

## Testing

### Test Structure

```
tests/
├── unit/              # Unit tests
│   ├── VerifierService.test.js
│   └── AlgorandService.test.js
├── integration/       # Integration tests
│   └── api.test.js
└── e2e/              # End-to-end tests
    └── workflow.test.js
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Smart contract tests
python -m pytest tests/test_contract_unit.py -v

# Integration tests
npm run test:integration

# All tests
npm run test:all
```

### Test Coverage

```bash
# Backend coverage
npm run test:coverage

# Frontend coverage
npm run test:coverage

# Generate coverage report
npm run coverage:report
```

## Deployment

### Development Deployment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
npm run migrate

# Seed test data
npm run seed
```

### Production Deployment

```bash
# Build and deploy
./deploy.sh deploy

# Health check
./deploy.sh health

# Rollback if needed
./deploy.sh rollback
```

### Docker Deployment

```bash
# Build image
docker build -t fairlens:latest .

# Run container
docker run -d -p 5000:5000 --env-file .env.production fairlens:latest
```

### Kubernetes Deployment

```bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services
```

## Monitoring

### Metrics

- **Application**: Request rate, response time, error rate
- **Infrastructure**: CPU, memory, disk usage
- **Database**: Connection pool, query performance
- **Blockchain**: Transaction success rate, gas usage

### Logging

- **Structured Logging**: JSON format with Winston
- **Log Levels**: Error, Warn, Info, Debug
- **Log Aggregation**: ELK Stack (Elasticsearch, Logstash, Kibana)

### Alerting

- **Health Checks**: Automated monitoring
- **Error Alerts**: Real-time notifications
- **Performance Alerts**: Threshold-based alerts

## Security

### Best Practices

- **Input Validation**: All inputs validated and sanitized
- **Authentication**: JWT with secure tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS**: Configured for production domains
- **HTTPS**: SSL/TLS encryption

### Security Testing

```bash
# Run security audit
npm audit

# Run bandit scan
bandit -r backend/

# Run safety check
safety check
```

## Contributing

### Development Workflow

1. **Fork Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make Changes**
4. **Write Tests**
5. **Run Tests**
   ```bash
   npm test
   ```
6. **Commit Changes**
   ```bash
   git commit -m "Add your feature"
   ```
7. **Push to Branch**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create Pull Request**

### Code Standards

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety (future)
- **JSDoc**: Documentation

### Pull Request Guidelines

- Clear description of changes
- Include tests for new features
- Update documentation
- Ensure all tests pass
- Follow code style guidelines

---

*Last updated: December 2024*
*Version: 1.0*
