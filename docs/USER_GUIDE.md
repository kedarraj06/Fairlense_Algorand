# FairLens User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Roles](#user-roles)
3. [Wallet Setup](#wallet-setup)
4. [Contract Management](#contract-management)
5. [Milestone Workflow](#milestone-workflow)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

## Getting Started

### 1. Account Creation
1. Visit the FairLens application
2. Click "Create Account" or "Sign Up"
3. Fill in your details:
   - Email address
   - Strong password (8+ characters with uppercase, lowercase, number, and special character)
   - Select your role (Government, Contractor, Verifier, or Viewer)
   - Optional: Add your Algorand wallet address
4. Click "Create Account"
5. You'll be automatically logged in

### 2. First Login
1. Enter your email and password
2. Click "Sign In"
3. You'll be redirected to the main dashboard

## User Roles

### Government/Owner
**Responsibilities:**
- Create and deploy smart contracts
- Add milestones to contracts
- Fund contract escrow accounts
- Monitor contractor progress
- Release payments upon verification

**Permissions:**
- Create contracts
- Manage milestones
- Fund escrow
- Release payments
- View all contract data

### Contractor
**Responsibilities:**
- Submit proof of work completion
- Track milestone progress
- Monitor payment status

**Permissions:**
- View assigned contracts
- Submit milestone proofs
- Track payment history

### Verifier (AI/Inspector)
**Responsibilities:**
- Review submitted proofs
- Create attestations for milestone completion
- Verify work quality and compliance

**Permissions:**
- View contract details
- Review submitted proofs
- Create attestations
- Access verification tools

### Viewer
**Responsibilities:**
- Monitor public contract information
- Track transparency metrics

**Permissions:**
- View public contract data
- Access transparency reports
- Monitor system statistics

## Wallet Setup

### 1. Install AlgoSigner
1. Visit [AlgoSigner.app](https://algosigner.app/)
2. Install the browser extension
3. Create a new wallet or import existing one
4. Switch to TestNet for development

### 2. Get TestNet ALGOs
1. Visit [Algorand TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
2. Enter your wallet address
3. Request test ALGOs (you'll receive 10 ALGOs)

### 3. Connect Wallet to FairLens
1. In FairLens, click "Connect Wallet"
2. Select "AlgoSigner"
3. Approve the connection in the AlgoSigner popup
4. Your wallet address will be displayed

## Contract Management

### Creating a Contract (Government Role)

1. **Deploy Smart Contract:**
   ```bash
   python scripts/deploy_testnet.py
   ```
   - Enter owner address (your wallet)
   - Enter contractor address
   - Enter verifier public key
   - Save the contract ID

2. **Add Contract to FairLens:**
   - Enter the contract ID in the application
   - Select your role as "Owner"
   - Click "Load Contract"

3. **Fund Escrow:**
   - Click "Fund Escrow"
   - Enter amount in microALGOs
   - Confirm transaction in AlgoSigner

### Adding Milestones

1. **Access Milestone Manager:**
   - Ensure you're logged in as Government/Owner
   - Have a contract loaded

2. **Add Milestone:**
   - Enter milestone index (starting from 0)
   - Set amount in microALGOs
   - Set due date
   - Add description or IPFS hash
   - Click "Add Milestone"

3. **Verify Addition:**
   - Check the contract dashboard
   - Confirm milestone appears in the list

## Milestone Workflow

### For Contractors

1. **Submit Proof:**
   - Navigate to Milestone Manager
   - Enter milestone index
   - Upload proof hash or IPFS hash
   - Click "Submit Proof"
   - Confirm transaction in AlgoSigner

2. **Track Status:**
   - Monitor contract dashboard
   - Check milestone status
   - Wait for verification

### For Verifiers

1. **Review Proof:**
   - Access submitted proofs
   - Review work quality
   - Check compliance requirements

2. **Create Attestation:**
   - Enter milestone index
   - Select status (PASS/FAIL/PENDING)
   - Enter milestone hash
   - Add proof hash
   - Click "Create Attestation"

3. **Automatic Payment:**
   - If status is PASS, payment is automatically released
   - Transaction is recorded on blockchain

### For Government

1. **Monitor Progress:**
   - View all milestone submissions
   - Track verification status
   - Monitor payment releases

2. **Manual Override:**
   - Can manually trigger payments if needed
   - Can update milestone details
   - Can change contractor or verifier

## Troubleshooting

### Common Issues

#### Wallet Connection Problems
**Problem:** AlgoSigner not connecting
**Solutions:**
- Ensure AlgoSigner extension is installed and enabled
- Check that you're on TestNet
- Refresh the page and try again
- Clear browser cache and cookies

#### Transaction Failures
**Problem:** Transactions failing
**Solutions:**
- Check wallet balance (need ALGOs for fees)
- Ensure sufficient escrow funding
- Verify contract ID is correct
- Check network connectivity

#### Contract Not Loading
**Problem:** Contract state not displaying
**Solutions:**
- Verify contract ID is correct
- Check if contract is deployed
- Ensure you have the right role
- Try refreshing the page

#### Payment Not Released
**Problem:** Milestone verified but payment not released
**Solutions:**
- Check escrow balance
- Verify attestation signature
- Ensure contract has sufficient funds
- Check transaction history

### Error Messages

#### "Insufficient Balance"
- Add more ALGOs to your wallet
- Use the TestNet dispenser

#### "Invalid Signature"
- Regenerate verifier keys
- Check attestation format

#### "Contract Not Found"
- Verify contract ID
- Ensure contract is deployed
- Check network (TestNet vs MainNet)

#### "Access Denied"
- Check your user role
- Ensure you're logged in
- Verify contract permissions

## FAQ

### General Questions

**Q: What is FairLens?**
A: FairLens is a blockchain-powered platform for transparent government tender management with milestone-based payments on Algorand.

**Q: Is it free to use?**
A: Yes, the platform is free to use. You only pay blockchain transaction fees.

**Q: Which blockchain does it use?**
A: FairLens is built on Algorand blockchain for fast, secure, and low-cost transactions.

### Technical Questions

**Q: What wallets are supported?**
A: Currently supports AlgoSigner. WalletConnect support is coming soon.

**Q: Can I use MainNet?**
A: Yes, but you need to update configuration and use real ALGOs instead of test tokens.

**Q: How secure is the platform?**
A: Very secure. Uses Ed25519 signature verification, smart contracts, and follows security best practices.

### Business Questions

**Q: Who can use FairLens?**
A: Government agencies, contractors, and verification services can all use the platform.

**Q: How are payments processed?**
A: Payments are automatically released when milestones are verified, using blockchain smart contracts.

**Q: Can I track all transactions?**
A: Yes, all transactions are recorded on the blockchain and can be viewed transparently.

### Support

**Q: Where can I get help?**
A: 
- Check this user guide
- Visit our documentation
- Contact support through the platform
- Join our community Discord

**Q: How do I report bugs?**
A: Use the feedback form in the application or create an issue on our GitHub repository.

---

*Last updated: December 2024*
*Version: 1.0*
