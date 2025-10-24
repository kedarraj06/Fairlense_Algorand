// frontend/src/components/blockchain/WalletDemo.tsx
// Demonstration component showing Pera Wallet integration

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { usePeraWallet } from '../../wallet/usePeraWallet';
import WalletIntegration from './WalletIntegration';

const WalletDemo = () => {
  const { 
    accountAddress, 
    isConnected, 
    balance,
    connectWallet,
    disconnectWallet,
    getBalance
  } = usePeraWallet();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pera Wallet Integration Demo</CardTitle>
          <CardDescription>
            This demo shows how to integrate Pera Wallet into your Algorand dApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Wallet Status</h3>
            {isConnected ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">Wallet Connected</div>
                <div className="text-sm text-green-600 mt-1">
                  Address: {accountAddress?.substring(0, 8)}...{accountAddress?.substring(accountAddress.length - 8)}
                </div>
                {balance !== null && (
                  <div className="text-sm text-green-600 mt-1">
                    Balance: {(Number(balance) / 1000000).toFixed(2)} ALGO
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-800">Wallet Not Connected</div>
                <div className="text-sm text-gray-600 mt-1">
                  Connect your Pera Wallet to interact with the blockchain
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <WalletIntegration />
      
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            After connecting your wallet, you can perform blockchain operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Once your wallet is connected, you can:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Deploy smart contracts</li>
              <li>Add milestones to contracts</li>
              <li>Submit proof of work</li>
              <li>Verify and release payments</li>
              <li>Fund escrow accounts</li>
            </ul>
            <p className="text-sm text-gray-600">
              All transactions are signed securely using Pera Wallet, ensuring your private keys never leave your device.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDemo;