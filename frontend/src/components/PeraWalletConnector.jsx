// frontend/src/components/PeraWalletConnector.jsx
// Enhanced wallet connector with Pera Algorand wallet support

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PeraWalletService from '../services/PeraWalletService';

const PeraWalletConnector = ({ onWalletConnected, onWalletDisconnected }) => {
  const [walletService] = useState(() => new PeraWalletService());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Check if wallet is already connected
    const status = walletService.getConnectionStatus();
    if (status.isConnected) {
      setIsConnected(true);
      setWalletAddress(status.address);
      setConnectionStatus('connected');
    }

    // Set up event listeners
    walletService.onConnect((result) => {
      if (result.success) {
        setIsConnected(true);
        setWalletAddress(result.address);
        setConnectionStatus('connected');
        setIsConnecting(false);
        setShowQRCode(false);
        toast.success('Pera wallet connected successfully!');
        
        if (onWalletConnected) {
          onWalletConnected({
            address: result.address,
            walletType: 'pera',
            accounts: result.accounts
          });
        }
      }
    });

    walletService.onDisconnect((result) => {
      setIsConnected(false);
      setWalletAddress('');
      setConnectionStatus('disconnected');
      setIsConnecting(false);
      setShowQRCode(false);
      toast.info('Pera wallet disconnected');
      
      if (onWalletDisconnected) {
        onWalletDisconnected();
      }
    });

    walletService.onSessionUpdate((result) => {
      if (result.success) {
        setWalletAddress(result.address);
        toast.info('Wallet session updated');
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, [walletService, onWalletConnected, onWalletDisconnected]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      
      const result = await walletService.connect();
      
      if (result.success) {
        setIsConnected(true);
        setWalletAddress(result.address);
        setConnectionStatus('connected');
        toast.success('Pera wallet connected successfully!');
        
        if (onWalletConnected) {
          onWalletConnected({
            address: result.address,
            walletType: 'pera',
            accounts: result.accounts
          });
        }
      } else {
        setIsConnecting(false);
        setConnectionStatus('disconnected');
        
        if (result.error === 'User rejected the connection') {
          toast.error('Connection cancelled by user');
        } else {
          toast.error(result.error || 'Failed to connect to Pera wallet');
        }
      }
    } catch (error) {
      setIsConnecting(false);
      setConnectionStatus('disconnected');
      console.error('Connection error:', error);
      toast.error('Failed to connect to Pera wallet');
    }
  };

  const handleDisconnect = async () => {
    try {
      const result = await walletService.disconnect();
      
      if (result.success) {
        setIsConnected(false);
        setWalletAddress('');
        setConnectionStatus('disconnected');
        toast.success('Pera wallet disconnected');
        
        if (onWalletDisconnected) {
          onWalletDisconnected();
        }
      } else {
        toast.error(result.error || 'Failed to disconnect from Pera wallet');
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      toast.error('Failed to disconnect from Pera wallet');
    }
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Address copied to clipboard!');
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4caf50';
      case 'connecting': return '#ff9800';
      case 'disconnected': return '#f44336';
      default: return '#757575';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <div className="pera-wallet-connector">
      <div className="wallet-header">
        <div className="wallet-info">
          <div className="wallet-icon">
            <img 
              src="https://perawallet.app/favicon.ico" 
              alt="Pera Wallet" 
              className="wallet-logo"
            />
          </div>
          <div className="wallet-details">
            <h3>Pera Algorand Wallet</h3>
            <p>Connect your Pera wallet to interact with FairLens</p>
          </div>
        </div>
        
        <div className="connection-status">
          <div 
            className="status-indicator" 
            style={{ backgroundColor: getStatusColor() }}
          ></div>
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>

      {!isConnected ? (
        <div className="connection-section">
          <div className="connection-options">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn btn-primary connect-btn"
            >
              {isConnecting ? (
                <span className="loading">
                  <span className="spinner"></span>
                  Connecting...
                </span>
              ) : (
                <>
                  <span className="btn-icon">🔗</span>
                  Connect Pera Wallet
                </>
              )}
            </button>
          </div>

          <div className="connection-help">
            <h4>How to connect:</h4>
            <ol>
              <li>Install Pera Algorand Wallet on your mobile device</li>
              <li>Click "Connect Pera Wallet" above</li>
              <li>Scan the QR code with your Pera wallet app</li>
              <li>Approve the connection in your wallet</li>
            </ol>
          </div>

          <div className="wallet-features">
            <h4>Features:</h4>
            <ul>
              <li>✅ Secure wallet connection</li>
              <li>✅ Transaction signing</li>
              <li>✅ Multi-account support</li>
              <li>✅ TestNet & MainNet support</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="connected-section">
          <div className="wallet-address">
            <div className="address-display">
              <span className="address-label">Connected Address:</span>
              <span className="address-value">{formatAddress(walletAddress)}</span>
              <button 
                onClick={copyAddress}
                className="copy-btn"
                title="Copy address"
              >
                📋
              </button>
            </div>
            <div className="full-address">
              <code>{walletAddress}</code>
            </div>
          </div>

          <div className="wallet-actions">
            <button
              onClick={handleDisconnect}
              className="btn btn-secondary disconnect-btn"
            >
              <span className="btn-icon">🔌</span>
              Disconnect
            </button>
          </div>

          <div className="wallet-info-card">
            <h4>Wallet Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Wallet Type:</span>
                <span className="info-value">Pera Algorand</span>
              </div>
              <div className="info-item">
                <span className="info-label">Network:</span>
                <span className="info-value">TestNet</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value connected">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQRCode && qrCodeData && (
        <div className="qr-modal">
          <div className="qr-content">
            <h3>Scan QR Code</h3>
            <p>Open Pera Algorand Wallet and scan this QR code</p>
            <div className="qr-code">
              <img src={qrCodeData} alt="Wallet Connect QR Code" />
            </div>
            <button 
              onClick={() => setShowQRCode(false)}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeraWalletConnector;
