# CURSOR_PROMPT.md
# Ready-to-Paste Cursor Prompt for FairLens

Copy and paste this prompt into Cursor to scaffold a complete FairLens MVP or production-ready system:

---

**Context**: We are building **FairLens** — a blockchain + AI system for transparent government tender lifecycle and milestone-based payments. Use **Algorand** chain. The team expects a working MVP (testnet) and a path to production. Deliver frontend (React), smart contract (PyTeal → TEAL), backend (Node.js) and an integration plan for verifier attestations (AI or inspector).

**MVP Requirements (testnet)**:

1. **Smart contract (PyTeal)**:
   * Stateful smart contract that stores `owner`, `contractor`, `N` milestones (amount, due_ts, ipfs_hash), and a current milestone pointer.
   * Methods: `add_ms`, `submit_proof`, `verify_release` (requires grouped txn with payment). Include unit tests for each method.
   * Use on-chain signature verification for verifier attestations (implement ed25519 verify) or require a fixed verifier public key. Add TEAL/AVM version compatibility notes.

2. **Frontend (React)**:
   * Pages: Create Tender (owner), Submit Proposal (contractor), Contract Dashboard (public read), Milestone Submit (contractor), Milestone Verify & Release (owner or oracle).
   * Wallet integration: support **AlgoSigner** and **WalletConnect** (ARC-0025). Provide a clear abstraction/wallet adapter.

3. **Backend (Node.js)**:
   * API endpoints:
     * `POST /api/attest` — accept AI / inspector attestations, store on IPFS (or DB) and return hash.
     * `GET /api/app/:appId/state` — read contract state via Algorand Indexer.
   * Provide example code to sign attestation with ed25519 private key used as "verifier" (for testing); include key rotation stub.

4. **Integration**:
   * Example flow: owner deploys contract → owner adds milestones → contractor submits proof → backend verifies and posts attestation → frontend triggers `verify_release` with grouped payment transaction.

5. **Tests**:
   * Unit tests for PyTeal → compile to TEAL and run negative tests (rejections).
   * Integration tests on TestNet using algosdk / AlgoSigner automation.

6. **DevOps**:
   * Provide `deploy.sh` / GitHub Actions for testnet deploy, and docs for mainnet steps.

**Non-functional / production guidance**:
* Security checklist (audit, KMS, least privilege).
* Scalability notes: when milestones > 50, use boxes or off-chain pointers.
* Privacy & compliance: store PII encrypted off-chain; only hashes on chain.
* Monitoring: indexer health checks, tx finality monitors.

**Deliverables**:
* Repo scaffold with `frontend/`, `backend/`, `contracts/` and `tests/`.
* Working demo link instructions (testnet) and step-by-step README for running locally (algorand sandbox or testnet).
* Sample attestation signer and verification example.
* Production runbook: deploy checklist, audit checklist, rollback steps.

**Acceptance criteria**:
1. End-to-end test (owner deploys, owner adds a milestone, contractor submits proof, verifier attests, contract releases payment as grouped txn) passes on TestNet.
2. Contract compiles to TEAL v6+ and passes static checks and unit tests.
3. Frontend can connect via AlgoSigner and submit the required app calls.
4. README contains explicit commands to reproduce demo with minimal secrets.

**Extra**: Provide 1) sample PyTeal file (simple MVP), 2) sample frontend snippet for AlgoSigner, 3) CI script skeleton, 4) a short security & audit plan.

**Priority**: build MVP first (testnet). After MVP, produce a separate "productionization" branch with KMS, CI secrets, audited contracts, and load tests.

---

## Additional Context for Cursor

### Key Files Already Created:

1. **Smart Contract**: `contracts/fairlens_app.py` - Production-ready PyTeal contract with Ed25519 verification and inner transactions
2. **Backend**: `backend/server.py` - Flask API with attestation endpoints and indexer integration
3. **Verifier**: `backend/verifier_sign.py` - Ed25519 signature generation and verification
4. **Frontend**: `frontend/src/` - React components with wallet integration
5. **Deployment**: `scripts/deploy_testnet.py` - Automated TestNet deployment
6. **Tests**: `tests/` - Comprehensive test suite
7. **CI/CD**: `.github/workflows/ci.yml` - GitHub Actions pipeline
8. **Documentation**: `README.md` and `PRODUCTION_CHECKLIST.md`

### Architecture Overview:

```
Frontend (React) ←→ Backend (Flask) ←→ Smart Contract (PyTeal)
     ↓                    ↓                    ↓
AlgoSigner Wallet    Attestation API      Algorand TestNet
     ↓                    ↓                    ↓
WalletConnect        IPFS Storage         Ed25519 Verification
```

### Key Features Implemented:

- **Ed25519 Signature Verification**: On-chain verification of AI/inspector attestations
- **Inner Transactions**: Automated milestone payments from contract escrow
- **Wallet Integration**: AlgoSigner and WalletConnect support
- **Real-time Monitoring**: Contract state tracking via Algorand Indexer
- **Comprehensive Testing**: Unit, integration, and security tests
- **Production Ready**: Security checklist, monitoring, and deployment automation

### Quick Start Commands:

```bash
# Clone and setup
git clone <repository>
cd fairlens
cp env.example .env
# Edit .env with your configuration

# Install dependencies
cd backend && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# Deploy contract
python scripts/deploy_testnet.py

# Start services
cd backend && python server.py &
cd frontend && npm start
```

### Test Commands:

```bash
# Run all tests
python tests/run_all_tests.py

# Individual test suites
python -m pytest tests/test_contract_unit.py -v
python -m pytest tests/test_backend_api.py -v
cd frontend && npm test
```

This prompt provides Cursor with everything needed to understand, extend, or modify the FairLens system. The codebase is production-ready with comprehensive documentation, testing, and deployment automation.
