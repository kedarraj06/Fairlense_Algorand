// frontend/src/components/WalletConnector.jsx
// Wallet connection component supporting AlgoSigner and WalletConnect

import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';

const WalletConnector = ({ onWalletConnected, onWalletDisconnected }) => {
  const [walletType, setWalletType] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if AlgoSigner is available
  useEffect(() => {
    if (window.AlgoSigner) {
      setWalletType('algosigner');
    }
  }, []);

  const connectAlgoSigner = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.AlgoSigner) {
        throw new Error('AlgoSigner not installed. Please install the AlgoSigner browser extension.');
      }

      // Connect to AlgoSigner
      await window.AlgoSigner.connect();
      
      // Get accounts
      const accounts = await window.AlgoSigner.accounts({
        ledger: 'TestNet' // or 'MainNet'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found in AlgoSigner');
      }

      const selectedAccount = accounts[0];
      setAccount(selectedAccount);
      setWalletType('algosigner');
      
      if (onWalletConnected) {
        onWalletConnected({
          address: selectedAccount.address,
          walletType: 'algosigner',
          signer: window.AlgoSigner
        });
      }

    } catch (err) {
      setError(err.message);
      console.error('AlgoSigner connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // WalletConnect integration would go here
      // For now, we'll show a placeholder
      throw new Error('WalletConnect integration coming soon');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setWalletType(null);
    setError(null);
    
    if (onWalletDisconnected) {
      onWalletDisconnected();
    }
  };

  if (account) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <h3>Wallet Connected</h3>
          <p><strong>Type:</strong> {walletType}</p>
          <p><strong>Address:</strong> {account.address}</p>
          <button onClick={disconnect} className="btn btn-secondary">
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connector">
      <h3>Connect Wallet</h3>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="wallet-options">
        <button
          onClick={connectAlgoSigner}
          disabled={isConnecting}
          className="btn btn-primary"
        >
          {isConnecting ? 'Connecting...' : 'Connect AlgoSigner'}
        </button>

        <button
          onClick={connectWalletConnect}
          disabled={isConnecting}
          className="btn btn-secondary"
        >
          {isConnecting ? 'Connecting...' : 'Connect WalletConnect'}
        </button>
      </div>

      <div className="wallet-help">
        <p>
          <strong>AlgoSigner:</strong> Browser extension wallet for Algorand
        </p>
        <p>
          <strong>WalletConnect:</strong> Mobile wallet support (coming soon)
        </p>
      </div>
    </div>
  );
};

export default WalletConnector;
