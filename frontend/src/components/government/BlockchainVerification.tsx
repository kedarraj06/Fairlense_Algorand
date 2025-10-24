// frontend/src/components/government/BlockchainVerification.tsx
// Blockchain verification component with wallet integration

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import WalletIntegration from '../blockchain/WalletIntegration';
import BlockchainTransaction from '../blockchain/BlockchainTransaction';

export default function BlockchainVerification() {
  const [accountAddress, setAccountAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  const [appId, setAppId] = useState('');
  const [contractState, setContractState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyContract = async () => {
    if (!appId) {
      alert('Please enter a contract ID');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate contract state fetching
      const result = {
        success: true,
        appId: appId,
        creator: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ',
        createdAt: 123456,
        updatedAt: 123457,
        globalState: {
          'owner': 'OWNER_ADDRESS',
          'contractor': 'CONTRACTOR_ADDRESS',
          'total_ms': 5,
          'cur_ms': 2
        }
      };
      
      setContractState(result);
    } catch (error) {
      alert('Error verifying contract: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">75% verification rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Integration */}
      <WalletIntegration />

      {/* Contract Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Verification</CardTitle>
          <CardDescription>
            Verify smart contracts deployed on the Algorand blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="contractId">Contract ID</Label>
              <Input
                id="contractId"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="Enter application ID"
              />
            </div>
            <Button 
              onClick={handleVerifyContract} 
              disabled={isLoading}
              className="self-end"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 animate-spin">🔄</span>
                  Verifying...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  Verify
                </>
              )}
            </Button>
          </div>

          {contractState && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Contract State</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">App ID:</span> {contractState.appId}
                </div>
                <div>
                  <span className="font-medium">Creator:</span> {contractState.creator?.substring(0, 8)}...{contractState.creator?.substring(contractState.creator.length - 8)}
                </div>
                <div>
                  <span className="font-medium">Created:</span> Round {contractState.createdAt}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> Round {contractState.updatedAt}
                </div>
              </div>
              
              {contractState.globalState && Object.keys(contractState.globalState).length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium mb-1">Global State</h4>
                  <div className="grid grid-cols-1 gap-1 text-sm">
                    {Object.entries(contractState.globalState).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blockchain Transactions */}
      {isConnected && appId && (
        <BlockchainTransaction contractAddress={contractAddress} appId={appId} />
      )}
    </div>
  );
}