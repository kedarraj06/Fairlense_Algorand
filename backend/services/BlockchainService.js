// backend/services/BlockchainService.js
// Blockchain service for FairLens backend with Algorand smart contract integration

const algosdk = require('algosdk');
const { approval_program, clear_state_program } = require('../contracts/fairlens_app');
const pyteal = require('pyteal');

class BlockchainService {
  constructor() {
    // Initialize Algod client
    this.algodToken = process.env.ALGOD_TOKEN || '';
    this.algodServer = process.env.ALGOD_ADDRESS || 'https://testnet-api.4160.nodely.dev';
    this.algodPort = process.env.ALGOD_PORT || '443';
    
    // Initialize Indexer client
    this.indexerToken = process.env.INDEXER_TOKEN || '';
    this.indexerServer = process.env.INDEXER_ADDRESS || 'https://testnet-idx.4160.nodely.dev';
    this.indexerPort = process.env.INDEXER_PORT || '';

    this.algodClient = new algosdk.Algodv2(this.algodToken, this.algodServer, this.algodPort);
    this.indexerClient = new algosdk.Indexer(this.indexerToken, this.indexerServer, this.indexerPort);
  }

  async compileContract() {
    try {
      // Compile approval program
      const approvalTeal = pyteal.compileTeal(approval_program(), pyteal.Mode.Application, version=6);
      
      // Compile clear state program
      const clearTeal = pyteal.compileTeal(clear_state_program(), pyteal.Mode.Application, version=6);
      
      return {
        success: true,
        approvalTeal,
        clearTeal
      };
    } catch (error) {
      console.error('Error compiling contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deployContract(deployerMnemonic, ownerAddress, contractorAddress, verifierPubkey) {
    try {
      // Get deployer account
      const deployerAccount = algosdk.mnemonicToSecretKey(deployerMnemonic);
      
      // Get suggested parameters
      const params = await this.algodClient.getTransactionParams().do();
      
      // Compile contract
      const compileResult = await this.compileContract();
      if (!compileResult.success) {
        throw new Error('Failed to compile contract: ' + compileResult.error);
      }
      
      // Create application creation transaction
      const txn = algosdk.makeApplicationCreateTxnFromObject({
        from: deployerAccount.addr,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compileResult.approvalTeal,
        clearProgram: compileResult.clearTeal,
        numLocalInts: 0,
        numLocalByteSlices: 0,
        numGlobalInts: 10,
        numGlobalByteSlices: 20,
        appArgs: [
          new TextEncoder().encode(ownerAddress),
          new TextEncoder().encode(contractorAddress),
          verifierPubkey
        ]
      });
      
      // Sign and send transaction
      const signedTxn = txn.signTxn(deployerAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      const confirmedTxn = await algosdk.waitForConfirmation(this.algodClient, txId.txId, 4);
      
      const appId = confirmedTxn['application-index'];
      const appAddress = algosdk.getApplicationAddress(appId);
      
      return {
        success: true,
        appId,
        appAddress,
        txId: txId.txId
      };
    } catch (error) {
      console.error('Error deploying contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async addMilestone(deployerMnemonic, appId, index, amount, dueDate, ipfsHash) {
    try {
      // Get deployer account
      const deployerAccount = algosdk.mnemonicToSecretKey(deployerMnemonic);
      
      // Get suggested parameters
      const params = await this.algodClient.getTransactionParams().do();
      
      // Create application call transaction
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        from: deployerAccount.addr,
        appIndex: appId,
        appArgs: [
          new TextEncoder().encode('add_ms'),
          algosdk.encodeUint64(index),
          algosdk.encodeUint64(amount),
          algosdk.encodeUint64(dueDate),
          new TextEncoder().encode(ipfsHash)
        ],
        suggestedParams: params
      });
      
      // Sign and send transaction
      const signedTxn = txn.signTxn(deployerAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId.txId, 4);
      
      return {
        success: true,
        txId: txId.txId
      };
    } catch (error) {
      console.error('Error adding milestone:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async submitProof(contractorMnemonic, appId, index, proofHash) {
    try {
      // Get contractor account
      const contractorAccount = algosdk.mnemonicToSecretKey(contractorMnemonic);
      
      // Get suggested parameters
      const params = await this.algodClient.getTransactionParams().do();
      
      // Create application call transaction
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        from: contractorAccount.addr,
        appIndex: appId,
        appArgs: [
          new TextEncoder().encode('submit_proof'),
          algosdk.encodeUint64(index),
          new TextEncoder().encode(proofHash)
        ],
        suggestedParams: params
      });
      
      // Sign and send transaction
      const signedTxn = txn.signTxn(contractorAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId.txId, 4);
      
      return {
        success: true,
        txId: txId.txId
      };
    } catch (error) {
      console.error('Error submitting proof:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyAndRelease(verifierPrivateKey, appId, index, message, signature) {
    try {
      // Get verifier account from private key
      const verifierAccount = algosdk.Account.fromSecretKey(verifierPrivateKey);
      
      // Get suggested parameters
      const params = await this.algodClient.getTransactionParams().do();
      
      // Create application call transaction
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        from: verifierAccount.addr,
        appIndex: appId,
        appArgs: [
          new TextEncoder().encode('verify_release'),
          algosdk.encodeUint64(index),
          new TextEncoder().encode(message),
          signature
        ],
        suggestedParams: params
      });
      
      // Sign and send transaction
      const signedTxn = txn.signTxn(verifierAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId.txId, 4);
      
      return {
        success: true,
        txId: txId.txId
      };
    } catch (error) {
      console.error('Error verifying and releasing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getApplicationState(appId) {
    try {
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
        app_id: appId,
        global_state: globalState,
        creator: app.creator,
        created_at: app['created-at-round'],
        updated_at: app['updated-at-round']
      };
    } catch (error) {
      console.error('Error getting application state:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getApplicationTransactions(appId, limit = 50) {
    try {
      const transactions = await this.indexerClient
        .searchForTransactions()
        .applicationID(appId)
        .limit(limit)
        .do();

      return {
        success: true,
        transactions
      };
    } catch (error) {
      console.error('Error getting application transactions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async fundContract(deployerMnemonic, appAddress, amount) {
    try {
      // Get deployer account
      const deployerAccount = algosdk.mnemonicToSecretKey(deployerMnemonic);
      
      // Get suggested parameters
      const params = await this.algodClient.getTransactionParams().do();
      
      // Create payment transaction
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: deployerAccount.addr,
        to: appAddress,
        amount: amount,
        suggestedParams: params
      });
      
      // Sign and send transaction
      const signedTxn = txn.signTxn(deployerAccount.sk);
      const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      // Wait for confirmation
      await algosdk.waitForConfirmation(this.algodClient, txId.txId, 4);
      
      return {
        success: true,
        txId: txId.txId
      };
    } catch (error) {
      console.error('Error funding contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const status = await this.algodClient.status().do();
      return {
        healthy: true,
        lastRound: status['last-round'],
        timeSinceLastRound: status['time-since-last-round']
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = BlockchainService;