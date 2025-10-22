# FairLens Quick Start Guide

Get up and running with FairLens in 5 minutes! 🚀

## 🎯 What You'll Build

A complete blockchain-powered government tender management system with:
- Pera Algorand wallet integration
- Smart contract milestone management
- AI-powered verification
- Automated payments

## ⚡ Quick Setup (5 Minutes)

### 1. Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://python.org/))
- **Pera Wallet** ([iOS](https://apps.apple.com/app/pera-algo-wallet/id1459898525) | [Android](https://play.google.com/store/apps/details?id=com.algorand.android))

### 2. Clone & Setup
```bash
git clone https://github.com/your-org/fairlens.git
cd fairlens

# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh && ./setup.sh
```

### 3. Configure Environment
Edit `.env` file with your Algorand API keys:
```bash
# Get free API keys from: https://developer.purestake.io/
ALGOD_TOKEN=your_token_here
INDEXER_TOKEN=your_token_here
```

### 4. Start the Application
```bash
# Terminal 1: Start Backend
cd backend
node server-simple.js

# Terminal 2: Start Frontend
cd frontend
npm start
```

### 5. Get TestNet ALGOs
1. Visit [Algorand TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
2. Enter your wallet address
3. Get 10 free test ALGOs

## 📱 Connect Your Wallet

1. **Open FairLens**: http://localhost:3000
2. **Click "Connect Pera Wallet"**
3. **Scan QR Code** with your Pera wallet app
4. **Approve Connection** in your wallet

## 🏗️ Deploy Your First Contract

```bash
python scripts/deploy_testnet.py
```

Enter your details:
- **Owner Address**: Your wallet address
- **Contractor Address**: Contractor's wallet
- **Verifier Public Key**: AI verifier's public key

## 🎉 You're Ready!

### What You Can Do Now:

#### As Government/Owner:
- ✅ Create smart contracts
- ✅ Add milestones
- ✅ Fund escrow accounts
- ✅ Monitor progress
- ✅ Release payments

#### As Contractor:
- ✅ Submit proof of work
- ✅ Track milestone progress
- ✅ Monitor payments
- ✅ View contract details

#### As Verifier:
- ✅ Review submitted proofs
- ✅ Create attestations
- ✅ Verify work quality
- ✅ Trigger payments

## 🔧 Troubleshooting

### Wallet Won't Connect?
- Ensure Pera wallet is on TestNet
- Clear browser cache
- Check network connection

### Backend Won't Start?
- Check if port 5000 is free
- Verify .env configuration
- Check Node.js version (18+)

### Frontend Won't Load?
- Check if backend is running
- Verify npm dependencies installed
- Check browser console for errors

### Contract Deployment Fails?
- Ensure you have test ALGOs
- Check wallet addresses are valid
- Verify API keys are correct

## 📚 Next Steps

1. **Read the Full Documentation**: [README.md](README.md)
2. **Explore User Guide**: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
3. **Check Developer Guide**: [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
4. **Join the Community**: [Discord](https://discord.gg/fairlens)

## 🆘 Need Help?

- **Documentation**: Check the `docs/` folder
- **Issues**: Create a GitHub issue
- **Community**: Join our Discord server
- **Email**: support@fairlens.org

---

**Happy Building! 🎊**

*Built with ❤️ for transparent government contracting*
