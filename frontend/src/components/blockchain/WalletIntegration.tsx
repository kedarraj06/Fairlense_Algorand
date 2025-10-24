// frontend/src/components/blockchain/WalletIntegration.tsx
// Wallet integration component for blockchain operations

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { usePeraWallet } from '../../wallet/usePeraWallet';

const WalletIntegration = () => {
  const {
    accountAddress,
    isConnected,
    balance,
    isLoading,
    connectWallet,
    disconnectWallet,
    getBalance
  } = usePeraWallet();
  
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast.success("Wallet Connected", {
        description: "Successfully connected to Pera Wallet"
      });
    } catch (error) {
      toast.error("Connection Failed", {
        description: error.message || "Failed to connect to Pera Wallet"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast.success("Wallet Disconnected", {
        description: "Successfully disconnected from Pera Wallet"
      });
    } catch (error) {
      toast.error("Disconnection Failed", {
        description: error.message || "Failed to disconnect from Pera Wallet"
      });
    }
  };

  const handleGetBalance = async () => {
    if (!accountAddress) return;
    
    setIsFetchingBalance(true);
    try {
      const result = await getBalance(accountAddress);
      if (result.success) {
        const algoBalance = result.balance ? (Number(result.balance) / 1000000).toFixed(2) : '0.00';
        toast.success("Balance Retrieved", {
          description: `Your balance is ${algoBalance} ALGO`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error("Balance Retrieval Failed", {
        description: error.message || "Failed to get account balance"
      });
    } finally {
      setIsFetchingBalance(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Integration</CardTitle>
        <CardDescription>
          Connect your Pera Wallet to interact with the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button 
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Connecting...' : 'Connect Pera Wallet'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="font-medium">Connected Wallet</div>
              <div className="text-sm text-gray-600 break-all">
                {accountAddress}
              </div>
              {balance !== null && (
                <div className="mt-2 text-sm">
                  Balance: {(Number(balance) / 1000000).toFixed(2)} ALGO
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleGetBalance}
                disabled={isFetchingBalance}
                className="flex-1"
              >
                {isFetchingBalance ? 'Fetching...' : 'Get Balance'}
              </Button>
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletIntegration;