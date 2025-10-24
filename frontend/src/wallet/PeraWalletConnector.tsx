// frontend/src/wallet/PeraWalletConnector.tsx
// Pera Wallet connector component for FairLens

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import peraWalletService from '../services/peraWallet';

interface PeraWalletConnectorProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

const PeraWalletConnector: React.FC<PeraWalletConnectorProps> = ({ 
  onConnect, 
  onDisconnect 
}) => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      const status = peraWalletService.getConnectionStatus();
      if (status.isConnected && status.address) {
        setAccountAddress(status.address);
        onConnect?.(status.address);
      }
    };

    checkConnection();
  }, [onConnect]);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const result = await peraWalletService.connect();
      
      if (result.success) {
        setAccountAddress(result.address);
        onConnect?.(result.address);
        
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to Pera Wallet"
        });
      } else {
        throw new Error(result.error || 'Failed to connect wallet');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Pera Wallet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await peraWalletService.disconnect();
      setAccountAddress(null);
      onDisconnect?.();
      
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from Pera Wallet"
      });
    } catch (error: any) {
      console.error('Wallet disconnection error:', error);
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect from Pera Wallet",
        variant: "destructive"
      });
    }
  };

  if (accountAddress) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Connected: {accountAddress.substring(0, 6)}...{accountAddress.substring(accountAddress.length - 4)}
        </div>
        <Button 
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={connectWallet}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isLoading ? 'Connecting...' : 'Connect Pera Wallet'}
    </Button>
  );
};

export default PeraWalletConnector;