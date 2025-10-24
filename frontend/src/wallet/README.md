# Pera Wallet Integration for FairLens

This directory contains all the necessary components and services to integrate Pera Wallet with the FairLens platform.

## Components

### 1. PeraWalletConnector.tsx
A React component that provides a simple UI for connecting and disconnecting from Pera Wallet.

### 2. WalletContext.tsx
A React context provider that manages the wallet connection state across the entire application.

### 3. usePeraWallet.ts
A custom React hook that provides easy access to all wallet functionality.

### 4. WalletIntegration.tsx
A complete wallet integration component that can be dropped into any part of the application.

### 5. BlockchainTransaction.tsx
A component that demonstrates how to perform various blockchain operations using the connected wallet.

## Services

### peraWallet.js
The core service that handles all Pera Wallet interactions, including:
- Connection and disconnection
- Transaction signing
- Balance retrieval
- Smart contract interactions

## Integration Guide

### 1. Setup Wallet Provider
Wrap your application with the WalletProvider in your main App component:

```jsx
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider>
      {/* Your app content */}
    </WalletProvider>
  );
}
```

### 2. Use the Wallet Hook
In any component, you can access wallet functionality using the usePeraWallet hook:

```jsx
import { usePeraWallet } from '../wallet/usePeraWallet';

function MyComponent() {
  const { 
    accountAddress, 
    isConnected, 
    connectWallet, 
    disconnectWallet 
  } = usePeraWallet();

  return (
    <div>
      {isConnected ? (
        <div>Connected: {accountAddress}</div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### 3. Use the Pre-built Components
You can also use the pre-built components for common wallet operations:

```jsx
import WalletIntegration from '../components/blockchain/WalletIntegration';

function MyPage() {
  return (
    <div>
      <WalletIntegration />
    </div>
  );
}
```

## Features

- ✅ Connect to Pera Wallet
- ✅ Disconnect from Pera Wallet
- ✅ Get account balance
- ✅ Sign transactions
- ✅ Deploy smart contracts
- ✅ Interact with smart contracts
- ✅ Fund escrow accounts
- ✅ Get application state

## Security

All private keys remain securely in the user's wallet and never leave the user's device. All transactions are signed by the user in the wallet interface.