// frontend/src/services/AlgorandService.js
// Algorand blockchain service for FairLens frontend

import algosdk from 'algosdk';

class AlgorandService {
  constructor() {
    // TestNet configuration
    this.algodToken = '';
    this.algodServer = 'https://testnet-algorand.api.purestake.io/ps2';
    this.algodPort = '';
    this.indexerToken = '';
    this.indexerServer = 'https://testnet-algorand.api.purestake.io/idx2';
    this.indexerPort = '';

    // Initialize clients
    this.algodClient = new algosdk.Algodv2(this.algodToken, this.algodServer, this.algodPort);
    this.indexerClient = new algosdk.Indexer(this.indexerToken, this.indexerServer, this.indexerPort);
  }

  // Get transaction parameters
  async getTransactionParams() {
    try {
      return await this.algodClient.getTransactionParams().do();
    } catch (error) {
      console.error('Error getting transaction params:', error);
      throw error;
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

  // Sign transaction with AlgoSigner
  async signWithAlgoSigner(txn) {
    try {
      if (!window.AlgoSigner) {
        throw new Error('AlgoSigner not available');
      }

      const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
      const signedTxn = await window.AlgoSigner.signTxn([{
        txn: encodedTxn.toString('base64')
      }]);

      return new Uint8Array(Buffer.from(signedTxn[0].blob, 'base64'));
    } catch (error) {
      console.error('Error signing with AlgoSigner:', error);
      throw error;
    }
  }

  // Send signed transaction
  async sendTransaction(signedTxn) {
    try {
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

  // Get application info
  async getApplicationInfo(appId) {
    try {
      const appInfo = await this.algodClient.getApplicationByID(appId).do();
      return appInfo;
    } catch (error) {
      console.error('Error getting application info:', error);
      throw error;
    }
  }

  // Get account info
  async getAccountInfo(address) {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return accountInfo;
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  // FairLens specific methods

  // Add milestone to contract
  async addMilestone(appId, sender, milestoneIndex, amount, dueTimestamp, ipfsHash) {
    try {
      const suggestedParams = await this.getTransactionParams();
      
      const appArgs = [
        new Uint8Array(Buffer.from('add_ms')),
        algosdk.encodeUint64(milestoneIndex),
        algosdk.encodeUint64(amount),
        algosdk.encodeUint64(dueTimestamp),
        new Uint8Array(Buffer.from(ipfsHash))
      ];

      const txn = await this.createAppCall(appId, sender, appArgs, suggestedParams);
      const signedTxn = await this.signWithAlgoSigner(txn);
      const txId = await this.sendTransaction(signedTxn);
      
      return await this.waitForConfirmation(txId);
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  }

  // Submit proof for milestone
  async submitProof(appId, sender, milestoneIndex, proofHash) {
    try {
      const suggestedParams = await this.getTransactionParams();
      
      const appArgs = [
        new Uint8Array(Buffer.from('submit_proof')),
        algosdk.encodeUint64(milestoneIndex),
        new Uint8Array(Buffer.from(proofHash))
      ];

      const txn = await this.createAppCall(appId, sender, appArgs, suggestedParams);
      const signedTxn = await this.signWithAlgoSigner(txn);
      const txId = await this.sendTransaction(signedTxn);
      
      return await this.waitForConfirmation(txId);
    } catch (error) {
      console.error('Error submitting proof:', error);
      throw error;
    }
  }

  // Verify and release payment
  async verifyAndRelease(appId, sender, milestoneIndex, messageBytes, signatureBytes) {
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
      const signedTxn = await this.signWithAlgoSigner(txn);
      const txId = await this.sendTransaction(signedTxn);
      
      return await this.waitForConfirmation(txId);
    } catch (error) {
      console.error('Error verifying and releasing:', error);
      throw error;
    }
  }

  // Fund escrow (send payment to app address)
  async fundEscrow(appId, sender, amount) {
    try {
      const appAddress = algosdk.getApplicationAddress(appId);
      const suggestedParams = await this.getTransactionParams();
      
      const txn = await this.createPayment(sender, appAddress, amount, suggestedParams);
      const signedTxn = await this.signWithAlgoSigner(txn);
      const txId = await this.sendTransaction(signedTxn);
      
      return await this.waitForConfirmation(txId);
    } catch (error) {
      console.error('Error funding escrow:', error);
      throw error;
    }
  }

  // Get contract state from backend API
  async getContractState(appId) {
    try {
      const response = await fetch(`http://localhost:5000/api/app/${appId}/state`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting contract state:', error);
      throw error;
    }
  }

  // Create attestation via backend API
  async createAttestation(attestationData) {
    try {
      const response = await fetch('http://localhost:5000/api/attest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attestationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating attestation:', error);
      throw error;
    }
  }
}

export default new AlgorandService();
