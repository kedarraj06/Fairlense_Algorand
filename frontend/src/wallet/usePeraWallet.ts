// Pera Wallet integration hook for FairLens frontend
// Handles Pera Algorand wallet connection and transactions

import { useState } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

// Initialize Pera wallet
let peraWallet: PeraWalletConnect | null = null;

const usePeraWallet = () => {
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [algodClient, setAlgodClient] = useState<algosdk.Algodv2 | null>(null);
  const [indexerClient, setIndexerClient] = useState<algosdk.Indexer | null>(null);

  // Initialize Algorand clients
  const initializeAlgorandClients = () => {
    const newAlgodClient = new algosdk.Algodv2(
      import.meta.env.VITE_ALGOD_TOKEN || '',
      import.meta.env.VITE_ALGOD_ADDRESS || 'https://testnet-api.4160.nodely.dev',
      import.meta.env.VITE_ALGOD_PORT || ''
    );

    const newIndexerClient = new algosdk.Indexer(
      import.meta.env.VITE_INDEXER_TOKEN || '',
      import.meta.env.VITE_INDEXER_ADDRESS || 'https://testnet-idx.4160.nodely.dev',
      import.meta.env.VITE_INDEXER_PORT || ''
    );

    setAlgodClient(newAlgodClient);
    setIndexerClient(newIndexerClient);
    
    return { algodClient: newAlgodClient, indexerClient: newIndexerClient };
  };

  // Connect to Pera wallet
  const connect = async () => {
    try {
      if (!peraWallet) {
        peraWallet = new PeraWalletConnect({
          chainId: parseInt(import.meta.env.VITE_PERAWALLET_CHAIN_ID || '416002') as any, // Algorand TestNet
        });
      }

      // Connect to wallet
      const accounts = await peraWallet.connect();
      
      setAccountAddress(accounts[0]);
      setIsConnected(true);

      // Initialize Algorand clients
      initializeAlgorandClients();

      return {
        success: true,
        accounts: accounts,
        address: accounts[0]
      };
    } catch (error: any) {
      console.error('Pera wallet connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Disconnect from Pera wallet
  const disconnect = async () => {
    try {
      if (peraWallet) {
        await peraWallet.disconnect();
      }
      
      setAccountAddress(null);
      setIsConnected(false);
      setAlgodClient(null);
      setIndexerClient(null);
      peraWallet = null;

      return { success: true };
    } catch (error: any) {
      console.error('Pera wallet disconnect error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Get account balance
  const getBalance = async (address: string) => {
    try {
      if (!algodClient) {
        initializeAlgorandClients();
      }

      const accountInfo = await algodClient!.accountInformation(address).do();
      
      return {
        success: true,
        balance: accountInfo.amount,
        assets: accountInfo.assets || []
      };
    } catch (error: any) {
      console.error('Error getting balance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Sign transaction
  const signTransaction = async (transaction: algosdk.Transaction) => {
    try {
      if (!isConnected || !peraWallet) {
        throw new Error('Wallet not connected');
      }

      const signedTxns = await peraWallet.signTransaction([[{txn: transaction, signers: [accountAddress!]}]]);
      return {
        success: true,
        signedTransaction: signedTxns[0][0]
      };
    } catch (error: any) {
      console.error('Transaction signing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Sign multiple transactions
  const signTransactions = async (transactions: algosdk.Transaction[]) => {
    try {
      if (!isConnected || !peraWallet) {
        throw new Error('Wallet not connected');
      }

      const signerTransactions = transactions.map(txn => ({
        txn: txn,
        signers: [accountAddress!]
      }));
      
      const signedTxs = await peraWallet.signTransaction([signerTransactions]);
      return {
        success: true,
        signedTransactions: signedTxs[0]
      };
    } catch (error: any) {
      console.error('Multiple transaction signing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Create application call transaction
  const createAppCall = async (
    appId: number, 
    sender: string, 
    appArgs: Uint8Array[], 
    suggestedParams: algosdk.SuggestedParams
  ) => {
    try {
      const txn = algosdk.makeApplicationNoOpTxnFromObject({
        sender: sender,
        appIndex: appId,
        appArgs: appArgs,
        suggestedParams: suggestedParams
      });
      return txn;
    } catch (error: any) {
      console.error('Error creating app call:', error);
      throw error;
    }
  };

  // Create payment transaction
  const createPayment = async (
    sender: string, 
    receiver: string, 
    amount: number, 
    suggestedParams: algosdk.SuggestedParams
  ) => {
    try {
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sender,
        receiver: receiver,
        amount: BigInt(amount),
        suggestedParams: suggestedParams
      });
      return txn;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  // Get transaction parameters
  const getTransactionParams = async () => {
    try {
      if (!algodClient) {
        initializeAlgorandClients();
      }
      return await algodClient!.getTransactionParams().do();
    } catch (error: any) {
      console.error('Error getting transaction params:', error);
      throw error;
    }
  };

  // Send transaction
  const sendTransaction = async (signedTxn: Uint8Array) => {
    try {
      if (!algodClient) {
        initializeAlgorandClients();
      }
      const txId = await algodClient!.sendRawTransaction(signedTxn).do();
      return txId;
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  };

  // Wait for transaction confirmation
  const waitForConfirmation = async (txId: string) => {
    try {
      if (!algodClient) {
        initializeAlgorandClients();
      }
      const confirmedTxn = await algosdk.waitForConfirmation(
        algodClient!,
        txId,
        4
      );
      return confirmedTxn;
    } catch (error: any) {
      console.error('Error waiting for confirmation:', error);
      throw error;
    }
  };

  // Deploy smart contract
  const deployContract = async (
    ownerAddress: string, 
    contractorAddress: string, 
    verifierPubkey: string, 
    projectTitle: string
  ) => {
    try {
      if (!algodClient) {
        initializeAlgorandClients();
      }

      const suggestedParams = await getTransactionParams();
      suggestedParams.flatFee = true;
      suggestedParams.fee = BigInt(1000);

      // Create application creation transaction
      const txn = algosdk.makeApplicationCreateTxnFromObject({
        sender: ownerAddress,
        suggestedParams: suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: new Uint8Array([84, 101, 97, 108, 32, 112, 114, 111, 103, 114, 97, 109, 32, 112, 108, 97, 99, 101, 104, 111, 108, 100, 101, 114]), // "Teal program placeholder" in ASCII
        clearProgram: new Uint8Array([84, 101, 97, 108, 32, 112, 114, 111, 103, 114, 97, 109, 32, 112, 108, 97, 99, 101, 104, 111, 108, 100, 101, 114]), // "Teal program placeholder" in ASCII
        numLocalInts: 0,
        numLocalByteSlices: 0,
        numGlobalInts: 10,
        numGlobalByteSlices: 20,
        appArgs: [
          new TextEncoder().encode(ownerAddress),
          new TextEncoder().encode(contractorAddress),
          new Uint8Array(verifierPubkey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []),
          new TextEncoder().encode(projectTitle)
        ]
      });

      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error: any) {
      console.error('Error deploying contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Add milestone to contract
  const addMilestone = async (
    appId: number, 
    sender: string, 
    milestoneIndex: number, 
    amount: number, 
    dueTimestamp: number, 
    description: string
  ) => {
    try {
      const suggestedParams = await getTransactionParams();
      
      const appArgs = [
        new TextEncoder().encode('add_milestone'),
        algosdk.encodeUint64(milestoneIndex),
        algosdk.encodeUint64(amount),
        algosdk.encodeUint64(dueTimestamp),
        new TextEncoder().encode(description)
      ];

      const txn = await createAppCall(appId, sender, appArgs, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error: any) {
      console.error('Error adding milestone:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Submit milestone proof
  const submitMilestoneProof = async (
    appId: number, 
    sender: string, 
    milestoneIndex: number, 
    proofHash: string
  ) => {
    try {
      const suggestedParams = await getTransactionParams();
      
      const appArgs = [
        new TextEncoder().encode('submit_proof'),
        algosdk.encodeUint64(milestoneIndex),
        new TextEncoder().encode(proofHash)
      ];

      const txn = await createAppCall(appId, sender, appArgs, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error: any) {
      console.error('Error submitting proof:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Verify and release payment
  const verifyAndReleasePayment = async (
    appId: number, 
    sender: string, 
    milestoneIndex: number, 
    messageBytes: Uint8Array, 
    signatureBytes: Uint8Array
  ) => {
    try {
      const suggestedParams = await getTransactionParams();
      
      // Increase fee to cover inner transaction
      suggestedParams.fee = BigInt(2000);
      suggestedParams.flatFee = true;
      
      const appArgs = [
        new TextEncoder().encode('verify_release'),
        algosdk.encodeUint64(milestoneIndex),
        new Uint8Array(messageBytes),
        new Uint8Array(signatureBytes)
      ];

      const txn = await createAppCall(appId, sender, appArgs, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error: any) {
      console.error('Error verifying and releasing:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Fund escrow account
  const fundEscrow = async (appId: number, sender: string, amount: number) => {
    try {
      const appAddress = algosdk.getApplicationAddress(appId);
      const suggestedParams = await getTransactionParams();
      
      const txn = await createPayment(sender, appAddress.toString(), amount, suggestedParams);
      return {
        success: true,
        transaction: txn,
        encodedTxn: algosdk.encodeUnsignedTransaction(txn)
      };

    } catch (error: any) {
      console.error('Error funding escrow:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Get application state
  const getApplicationState = async (appId: number) => {
    try {
      if (!indexerClient) {
        initializeAlgorandClients();
      }

      const appInfo = await indexerClient!.lookupApplications(appId).do();
      
      if (!appInfo || !appInfo.application) {
        return {
          success: false,
          error: 'Application not found'
        };
      }

      const app = appInfo.application;
      
      // Parse global state
      const globalState: Record<string, any> = {};
      if (app.params && app.params.globalState) {
        for (const state of app.params.globalState) {
          // Fix Buffer issues by using TextDecoder
          const key = new TextDecoder().decode(new Uint8Array(state.key));
          let value;
          
          if (state.value.type === 1) { // bytes
            value = new TextDecoder().decode(new Uint8Array(state.value.bytes));
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
        creator: (app as any).creator,
        createdAt: (app as any).createdAtRound,
        updatedAt: (app as any).updatedAtRound
      };

    } catch (error: any) {
      console.error('Error getting application state:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Get connection status
  const getConnectionStatus = () => {
    return {
      isConnected: isConnected,
      address: accountAddress
    };
  };

  // Check if Pera wallet is available
  const isPeraWalletAvailable = () => {
    return typeof window !== 'undefined';
  };

  return {
    // State
    accountAddress,
    isConnected,
    
    // Actions
    connect,
    disconnect,
    getBalance,
    signTransaction,
    signTransactions,
    createAppCall,
    createPayment,
    getTransactionParams,
    sendTransaction,
    waitForConfirmation,
    deployContract,
    addMilestone,
    submitMilestoneProof,
    verifyAndReleasePayment,
    fundEscrow,
    getApplicationState,
    getConnectionStatus,
    isPeraWalletAvailable
  };
};

export default usePeraWallet;