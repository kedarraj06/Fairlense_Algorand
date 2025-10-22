// backend/services/AlgorandService.js
// Algorand blockchain integration service

const algosdk = require('algosdk');

class AlgorandService {
  constructor() {
    // Initialize Algod client
    this.algodToken = process.env.ALGOD_TOKEN || '';
    this.algodServer = process.env.ALGOD_ADDRESS || 'https://testnet-algorand.api.purestake.io/ps2';
    this.algodPort = process.env.ALGOD_PORT || '';
    
    // Initialize Indexer client
    this.indexerToken = process.env.INDEXER_TOKEN || '';
    this.indexerServer = process.env.INDEXER_ADDRESS || 'https://testnet-algorand.api.purestake.io/idx2';
    this.indexerPort = process.env.INDEXER_PORT || '';

    this.algodClient = new algosdk.Algodv2(this.algodToken, this.algodServer, this.algodPort);
    this.indexerClient = new algosdk.Indexer(this.indexerToken, this.indexerServer, this.indexerPort);
  }

  async getApplicationState(appId) {
    try {
      const appInfo = await this.indexerClient.lookupApplicationByID(appId).do();
      
      if (!appInfo || !appInfo.application) {
        return null;
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
        app_id: appId,
        global_state: globalState,
        creator: app.creator,
        created_at: app['created-at-round'],
        updated_at: app['updated-at-round']
      };

    } catch (error) {
      console.error('Error getting application state:', error);
      throw error;
    }
  }

  async getApplicationTransactions(appId, limit = 50) {
    try {
      const transactions = await this.indexerClient
        .searchForTransactions()
        .applicationID(appId)
        .limit(limit)
        .do();

      return transactions;

    } catch (error) {
      console.error('Error getting application transactions:', error);
      throw error;
    }
  }

  async getAccountInfo(address) {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return accountInfo;
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  async getTransactionParams() {
    try {
      const params = await this.algodClient.getTransactionParams().do();
      return params;
    } catch (error) {
      console.error('Error getting transaction params:', error);
      throw error;
    }
  }

  async waitForConfirmation(txId, timeout = 10000) {
    try {
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

  // Utility methods for encoding/decoding
  encodeUint64(value) {
    return algosdk.encodeUint64(value);
  }

  decodeUint64(bytes) {
    return algosdk.decodeUint64(bytes);
  }

  getApplicationAddress(appId) {
    return algosdk.getApplicationAddress(appId);
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

module.exports = AlgorandService;
