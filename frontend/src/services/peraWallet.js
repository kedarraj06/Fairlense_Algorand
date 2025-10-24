// Pera Wallet integration service for FairLens frontend
// Handles Pera Algorand wallet connection and transactions

import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

class PeraWalletService {
  constructor() {
    this.isConnected = false;
    this.accounts = [];
    this.address = null;
    this.peraWallet = null;
    this.algodClient = null;
    this.indexerClient = null;
  }

  // Initialize Pera wallet connection
  async connect() {
    try {
      // Check if Pera wallet is available
      if (typeof window !== 'undefined' && window.PeraWalletConnect) {
        this.peraWallet = new PeraWalletConnect({
          chainId: 416002, // Algorand TestNet
        });

        // Connect to wallet
        const accounts = await this.peraWallet.connect();
        
        this.accounts = accounts;
        this.address = accounts[0];
        this.isConnected = true;

        // Initialize Algorand clients
        this.initializeAlgorandClients();

        // Set up event listeners
        this.setupEventListeners();

        return {
          success: true,
          accounts: this.accounts,
          address: this.address
        };
      } else {
        throw new Error('Pera wallet not available. Please install Pera wallet extension.');
      }
    } catch (error) {
      console.error('Pera wallet connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Initialize Algorand clients
  initializeAlgorandClients() {
    this.algodClient = new algosdk.Algodv2(
      import.meta.env.VITE_ALGOD_TOKEN || '',
      import.meta.env.VITE_ALGOD_ADDRESS || 'https://testnet-algorand.api.purestake.io/ps2',
      import.meta.env.VITE_ALGOD_PORT || ''
    );

    this.indexerClient = new algosdk.Indexer(
      import.meta.env.VITE_INDEXER_TOKEN || '',
      import.meta.env.VITE_INDEXER_ADDRESS || 'https://testnet-algorand.api.purestake.io/idx2',
      import.meta.env.VITE_INDEXER_PORT || ''
    );
  }

  // Disconnect from Pera wallet
  async disconnect() {
    try {
      if (this.peraWallet) {
        await this.peraWallet.disconnect();
      }
      
      this.isConnected = false;
      this.accounts = [];
      this.address = null;
      this.peraWallet = null;
      this.algodClient = null;
      this.indexerClient = null;

      return { success: true };
    } catch (error) {
      console.error('Pera wallet disconnect error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Set up event listeners
  setupEventListeners() {
    if (this.peraWallet) {
      this.peraWallet.connector.on('connect', (error, payload) => {
        if (error) {
          console.error('Connection error:', error);
          return;
        }
        
        this.accounts = payload.params[0].accounts;
        this.address = this.accounts[0];
        this.isConnected = true;
      });

      this.peraWallet.connector.on('disconnect', (error, payload) => {
        if (error) {
          console.error('Disconnection error:', error);
          return;
        }
        
        this.accounts = [];
        this.address = null;
        this.isConnected = false;
      });
    }
  }

  // Get account balance
  async getBalance(address = null) {
    try {
      const targetAddress = address || this.address;
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      if (!this.algodClient) {
        this.initializeAlgorandClients();
      }

      const accountInfo = await this.algodClient.accountInformation(targetAddress).do();
      
      return {
        success: true,
        balance: accountInfo.amount,
        assets: accountInfo.assets || []
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sign transaction
  async signTransaction(transaction) {
    try {
      if (!this.isConnected || !this.peraWallet) {
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
        error: error.message
      };
    }
  }

  // Sign multiple transactions
  async signTransactions(transactions) {
    try {
      if (!this.isConnected || !this.peraWallet) {
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
        error: error.message
      };
    }
  }

  // Create application call transaction
  async createAppCall(appId, sender, appArgs, suggestedParams) {
    try {
      const txn = algosdk.makeApplicationNoOpTxn(
        sender,
        suggestedParams,
        appId,
        appArgs
      );
      return txn;
    } catch (error) {
      console.error('Error creating app call:', error);
      throw error;
    }
  }

  // Create payment transaction
  async createPayment(sender, receiver, amount, suggestedParams) {
    try {
      const txn = algosdk.makePaymentTxnWithSuggestedParams(
        sender,
        receiver,
        amount,
        undefined,
        undefined,
        suggestedParams
      );
      return txn;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Get transaction parameters
  async getTransactionParams() {
    try {
      if (!this.algodClient) {
        this.initializeAlgorandClients();
      }
      return await this.algodClient.getTransactionParams().do();
    } catch (error) {
      console.error('Error getting transaction params:', error);
      throw error;
    }
  }

  // Send transaction
  async sendTransaction(signedTxn) {
    try {
      if (!this.algodClient) {
        this.initializeAlgorandClients();
      }
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      return txId;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  // Wait for transaction confirmation
  async waitForConfirmation(txId, timeout = 10000) {
    try {
      if (!this.algodClient) {
        this.initializeAlgorandClients();
      }
      const confirmedTxn = await algosdk.waitForConfirmation(
        this.algodClient,
        txId,
        4,
        timeout
      );
      return confirmedTxn;
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw error;
    }
  }

  // Deploy smart contract
  async deployContract(ownerAddress, contractorAddress, verifierPubkey, projectTitle) {
    try {
      if (!this.algodClient) {
        this.initializeAlgorandClients();
      }

      const suggestedParams = await this.getTransactionParams();
      suggestedParams.flat_fee = true;
      suggestedParams.fee = 1000;

      // Create application creation transaction
      const txn = algosdk.makeApplicationCreateTxn(
        ownerAddress,
        suggestedParams,
        algosdk.OnComplete.NoOpOC,
        this.getApprovalProgram(),
        this.getClearProgram(),
        algosdk.makeApplicationOptInTxn,
        algosdk.makeApplicationCloseOutTxn,
        algosdk.makeApplicationClearStateTxn,
        algosdk.makeApplicationUpdateTxn,
        algosdk.makeApplicationDeleteTxn,
        new algosdk.StateSchema(10, 20), // 10 uints, 20 byte slices
        new algosdk.StateSchema(0, 0),  // 0 uints, 0 byte slices
        [
          algosdk.decodeAddress(ownerAddress),
          algosdk.decodeAddress(contractorAddress),
          Buffer.from(verifierPubkey, 'hex'),
          Buffer.from(projectTitle, 'utf8')
        ]
      );

      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error) {
      console.error('Error deploying contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add milestone to contract
  async addMilestone(appId, sender, milestoneIndex, amount, dueTimestamp, description) {
    try {
      const suggestedParams = await this.getTransactionParams();
      
      const appArgs = [
        new Uint8Array(Buffer.from('add_milestone')),
        algosdk.encodeUint64(milestoneIndex),
        algosdk.encodeUint64(amount),
        algosdk.encodeUint64(dueTimestamp),
        new Uint8Array(Buffer.from(description, 'utf8'))
      ];

      const txn = await this.createAppCall(appId, sender, appArgs, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error) {
      console.error('Error adding milestone:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Submit milestone proof
  async submitMilestoneProof(appId, sender, milestoneIndex, proofHash) {
    try {
      const suggestedParams = await this.getTransactionParams();
      
      const appArgs = [
        new Uint8Array(Buffer.from('submit_proof')),
        algosdk.encodeUint64(milestoneIndex),
        new Uint8Array(Buffer.from(proofHash, 'utf8'))
      ];

      const txn = await this.createAppCall(appId, sender, appArgs, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error) {
      console.error('Error submitting proof:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify and release payment
  async verifyAndReleasePayment(appId, sender, milestoneIndex, messageBytes, signatureBytes) {
    try {
      const suggestedParams = await this.getTransactionParams();
      
      // Increase fee to cover inner transaction
      suggestedParams.fee = 2000;
      suggestedParams.flatFee = true;
      
      const appArgs = [
        new Uint8Array(Buffer.from('verify_release')),
        algosdk.encodeUint64(milestoneIndex),
        new Uint8Array(messageBytes),
        new Uint8Array(signatureBytes)
      ];

      const txn = await this.createAppCall(appId, sender, appArgs, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error) {
      console.error('Error verifying and releasing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fund escrow account
  async fundEscrow(appId, sender, amount) {
    try {
      const appAddress = algosdk.getApplicationAddress(appId);
      const suggestedParams = await this.getTransactionParams();
      
      const txn = await this.createPayment(sender, appAddress, amount, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error) {
      console.error('Error funding escrow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get application state
  async getApplicationState(appId) {
    try {
      if (!this.indexerClient) {
        this.initializeAlgorandClients();
      }

      const appInfo = await this.indexerClient.lookupApplicationByID(appId).do();
      
      if (!appInfo || !appInfo.application) {
        return {
          success: false,
          error: 'Application not found'
        };
      }

      const app = appInfo.application;
      
      // Parse global state
      const globalState = {};
      if (app.params && app.params['global-state']) {
        for (const state of app.params['global-state']) {
          const key = Buffer.from(state.key, 'base64').toString('utf8');
          let value;
          
          if (state.value.type === 1) { // bytes
            value = Buffer.from(state.value.bytes, 'base64').toString('utf8');
          } else if (state.value.type === 2) { // uint64
            value = state.value.uint;
          } else {
            value = state.value;
          }
          
          globalState[key] = value;
        }
      }

      return {
        success: true,
        appId: appId,
        globalState: globalState,
        creator: app.creator,
        createdAt: app['created-at-round'],
        updatedAt: app['updated-at-round']
      };

    } catch (error) {
      console.error('Error getting application state:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get approval program (placeholder - in real implementation, this would load compiled TEAL)
  getApprovalProgram() {
    // This would be the compiled TEAL program
    // For now, return a placeholder
    return Buffer.from('placeholder_approval_program');
  }

  // Get clear program (placeholder - in real implementation, this would load compiled TEAL)
  getClearProgram() {
    // This would be the compiled TEAL program
    // For now, return a placeholder
    return Buffer.from('placeholder_clear_program');
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      accounts: this.accounts,
      address: this.connectedAccounts.length > 0 ? this.accounts[0] : null
    };
  }

  // Check if Pera wallet is available
  isPeraWalletAvailable() {
    return typeof window !== 'undefined' && window.PeraWalletConnect;
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

// Create and export a singleton instance
const peraWalletService = new PeraWalletService();
export default peraWalletService;