// PeraWalletService.js
// Pera Algorand Wallet integration service for FairLens

const algosdk = require('algosdk');

class PeraWalletService {
  constructor() {
    this.algodClient = null;
    this.indexerClient = null;
    this.connectedAccounts = [];
    this.isConnected = false;
  }

  // Initialize Algorand clients
  initializeClients() {
    this.algodClient = new algosdk.Algodv2(
      process.env.ALGOD_TOKEN || '',
      process.env.ALGOD_ADDRESS || 'https://testnet-algorand.api.purestake.io/ps2',
      process.env.ALGOD_PORT || ''
    );

    this.indexerClient = new algosdk.Indexer(
      process.env.INDEXER_TOKEN || '',
      process.env.INDEXER_ADDRESS || 'https://testnet-algorand.api.purestake.io/idx2',
      process.env.INDEXER_PORT || ''
    );
  }

  // Connect to Pera wallet (simulated for backend)
  async connectWallet(walletAddress) {
    try {
      this.initializeClients();
      
      // Verify the address is valid
      if (!algosdk.isValidAddress(walletAddress)) {
        throw new Error('Invalid Algorand address');
      }

      // Get account info to verify it exists
      const accountInfo = await this.algodClient.accountInformation(walletAddress).do();
      
      this.connectedAccounts = [walletAddress];
      this.isConnected = true;

      return {
        success: true,
        address: walletAddress,
        balance: accountInfo.amount,
        accounts: this.connectedAccounts
      };

    } catch (error) {
      console.error('Pera wallet connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    this.connectedAccounts = [];
    this.isConnected = false;
    return { success: true };
  }

  // Get account balance
  async getAccountBalance(address) {
    try {
      if (!this.algodClient) {
        this.initializeClients();
      }

      const accountInfo = await this.algodClient.accountInformation(address).do();
      return {
        success: true,
        balance: accountInfo.amount,
        assets: accountInfo.assets || []
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
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
        this.initializeClients();
      }
      return await this.algodClient.getTransactionParams().do();
    } catch (error) {
      console.error('Error getting transaction params:', error);
      throw error;
    }
  }

  // Send transaction (for backend processing)
  async sendTransaction(signedTxn) {
    try {
      if (!this.algodClient) {
        this.initializeClients();
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
        this.initializeClients();
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
        this.initializeClients();
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
        this.initializeClients();
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
      accounts: this.connectedAccounts,
      address: this.connectedAccounts.length > 0 ? this.connectedAccounts[0] : null
    };
  }
}

module.exports = PeraWalletService;
