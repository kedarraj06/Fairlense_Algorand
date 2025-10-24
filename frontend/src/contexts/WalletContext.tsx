// frontend/src/contexts/WalletContext.tsx
// Wallet context for managing Pera Wallet connection state

import React, { createContext, useContext, useState, useEffect } from 'react';
import peraWalletService from '../services/peraWallet';

const WalletContext = createContext(undefined);

const WalletProvider = ({ children }) => {
  const [accountAddress, setAccountAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const status = peraWalletService.getConnectionStatus();
      if (status.isConnected && status.address) {
        setAccountAddress(status.address);
        setIsConnected(true);
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      const result = await peraWalletService.connect();
      
      if (result.success) {
        setAccountAddress(result.address || null);
        setIsConnected(true);
      } else {
        throw new Error(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await peraWalletService.disconnect();
      setAccountAddress(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      throw error;
    }
  };

  const getBalance = async (address) => {
    try {
      const result = await peraWalletService.getBalance(address);
      return result;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  };

  const value = {
    accountAddress,
    isConnected,
    connectWallet,
    disconnectWallet,
    getBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export { WalletProvider, useWallet };