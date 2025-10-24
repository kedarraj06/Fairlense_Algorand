// frontend/src/wallet/usePeraWallet.ts
// Custom hook for Pera Wallet integration

import { useState, useEffect } from 'react';
import peraWalletService from '../services/peraWallet';

export const usePeraWallet = () => {
  const [accountAddress, setAccountAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const result = await peraWalletService.connect();
      
      if (result.success) {
        setAccountAddress(result.address || null);
        setIsConnected(true);
        return result;
      } else {
        throw new Error(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await peraWalletService.disconnect();
      setAccountAddress(null);
      setIsConnected(false);
      setBalance(null);
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      throw error;
    }
  };

  const getBalance = async (address) => {
    try {
      const result = await peraWalletService.getBalance(address);
      if (result.success) {
        setBalance(result.balance);
      }
      return result;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  };

  const signTransaction = async (transaction) => {
    try {
      const result = await peraWalletService.signTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  };

  const signTransactions = async (transactions) => {
    try {
      const result = await peraWalletService.signTransactions(transactions);
      return result;
    } catch (error) {
      console.error('Error signing transactions:', error);
      throw error;
    }
  };

  const deployContract = async (ownerAddress, contractorAddress, verifierPubkey, projectTitle) => {
    try {
      const result = await peraWalletService.deployContract(ownerAddress, contractorAddress, verifierPubkey, projectTitle);
      return result;
    } catch (error) {
      console.error('Error deploying contract:', error);
      throw error;
    }
  };

  const addMilestone = async (appId, sender, milestoneIndex, amount, dueTimestamp, description) => {
    try {
      const result = await peraWalletService.addMilestone(appId, sender, milestoneIndex, amount, dueTimestamp, description);
      return result;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  };

  const submitMilestoneProof = async (appId, sender, milestoneIndex, proofHash) => {
    try {
      const result = await peraWalletService.submitMilestoneProof(appId, sender, milestoneIndex, proofHash);
      return result;
    } catch (error) {
      console.error('Error submitting proof:', error);
      throw error;
    }
  };

  const verifyAndReleasePayment = async (appId, sender, milestoneIndex, messageBytes, signatureBytes) => {
    try {
      const result = await peraWalletService.verifyAndReleasePayment(appId, sender, milestoneIndex, messageBytes, signatureBytes);
      return result;
    } catch (error) {
      console.error('Error verifying and releasing payment:', error);
      throw error;
    }
  };

  const fundEscrow = async (appId, sender, amount) => {
    try {
      const result = await peraWalletService.fundEscrow(appId, sender, amount);
      return result;
    } catch (error) {
      console.error('Error funding escrow:', error);
      throw error;
    }
  };

  const getApplicationState = async (appId) => {
    try {
      const result = await peraWalletService.getApplicationState(appId);
      return result;
    } catch (error) {
      console.error('Error getting application state:', error);
      throw error;
    }
  };

  return {
    accountAddress,
    isConnected,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet,
    getBalance,
    signTransaction,
    signTransactions,
    deployContract,
    addMilestone,
    submitMilestoneProof,
    verifyAndReleasePayment,
    fundEscrow,
    getApplicationState
  };
};

export default usePeraWallet;