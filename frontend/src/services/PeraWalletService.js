// frontend/src/services/PeraWalletService.js
// Pera Algorand Wallet integration with WalletConnect

import { PeraWalletConnect } from '@perawallet/connect';
import QRCodeModal from '@walletconnect/qrcode-modal';
import QRCode from 'qrcode';

class PeraWalletService {
  constructor() {
    this.peraWallet = new PeraWalletConnect({
      chainId: 416002, // Algorand TestNet
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
    });

    this.accounts = [];
    this.isConnected = false;
    this.isConnecting = false;
  }

  // Connect to Pera wallet via WalletConnect
  async connect() {
    try {
      this.isConnecting = true;
      
      // Check if already connected
      if (this.peraWallet.isConnected) {
        this.accounts = this.peraWallet.accounts;
        this.isConnected = true;
        return {
          success: true,
          accounts: this.accounts,
          address: this.accounts[0]
        };
      }

      // Create new connection
      const accounts = await this.peraWallet.connect();
      this.accounts = accounts;
      this.isConnected = true;
      this.isConnecting = false;

      return {
        success: true,
        accounts: this.accounts,
        address: this.accounts[0]
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Pera wallet connection error:', error);
      
      if (error.message === 'User rejected the connection') {
        return {
          success: false,
          error: 'User rejected the connection'
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to connect to Pera wallet'
      };
    }
  }

  // Disconnect from Pera wallet
  async disconnect() {
    try {
      await this.peraWallet.disconnect();
      this.accounts = [];
      this.isConnected = false;
      return { success: true };
    } catch (error) {
      console.error('Pera wallet disconnect error:', error);
      return {
        success: false,
        error: error.message || 'Failed to disconnect from Pera wallet'
      };
    }
  }

  // Get connected accounts
  getAccounts() {
    return this.accounts;
  }

  // Get primary account address
  getAddress() {
    return this.accounts.length > 0 ? this.accounts[0] : null;
  }

  // Check if wallet is connected
  isWalletConnected() {
    return this.isConnected && this.accounts.length > 0;
  }

  // Sign transaction
  async signTransaction(transaction) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const signedTx = await this.peraWallet.signTransaction([transaction]);
      return {
        success: true,
        signedTransaction: signedTx[0]
      };
    } catch (error) {
      console.error('Transaction signing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign transaction'
      };
    }
  }

  // Sign multiple transactions
  async signTransactions(transactions) {
    try {
      if (!this.isConnected) {
        throw new Error('Wallet not connected');
      }

      const signedTxs = await this.peraWallet.signTransaction(transactions);
      return {
        success: true,
        signedTransactions: signedTxs
      };
    } catch (error) {
      console.error('Multiple transaction signing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign transactions'
      };
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      accounts: this.accounts,
      address: this.getAddress()
    };
  }

  // Listen for connection events
  onConnect(callback) {
    this.peraWallet.connector.on('connect', (error, payload) => {
      if (error) {
        console.error('Connection error:', error);
        return;
      }
      
      this.accounts = payload.params[0].accounts;
      this.isConnected = true;
      callback({
        success: true,
        accounts: this.accounts,
        address: this.accounts[0]
      });
    });
  }

  // Listen for disconnect events
  onDisconnect(callback) {
    this.peraWallet.connector.on('disconnect', (error, payload) => {
      if (error) {
        console.error('Disconnection error:', error);
        return;
      }
      
      this.accounts = [];
      this.isConnected = false;
      callback({ success: true });
    });
  }

  // Listen for session update events
  onSessionUpdate(callback) {
    this.peraWallet.connector.on('session_update', (error, payload) => {
      if (error) {
        console.error('Session update error:', error);
        return;
      }
      
      this.accounts = payload.params[0].accounts;
      callback({
        success: true,
        accounts: this.accounts,
        address: this.accounts[0]
      });
    });
  }

  // Generate QR code for connection
  async generateQRCode(uri) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(uri);
      return {
        success: true,
        qrCode: qrCodeDataURL
      };
    } catch (error) {
      console.error('QR code generation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate QR code'
      };
    }
  }

  // Get wallet info
  getWalletInfo() {
    return {
      name: 'Pera Algorand Wallet',
      icon: 'https://perawallet.app/favicon.ico',
      description: 'Connect to Pera Algorand Wallet',
      website: 'https://perawallet.app',
      isConnected: this.isConnected,
      accounts: this.accounts
    };
  }
}

export default PeraWalletService;
