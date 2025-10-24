// scripts/deploy-contract.js
// Script to deploy the FairLens smart contract

const { approval_program, clear_state_program } = require('../contracts/fairlens_app');
const pyteal = require('pyteal');
const algosdk = require('algosdk');
require('dotenv').config();

async function deployContract() {
  try {
    console.log('Deploying FairLens smart contract...');
    
    // Get environment variables
    const deployerMnemonic = process.env.DEPLOYER_MNEMONIC;
    const ownerAddress = process.env.OWNER_ADDRESS;
    const contractorAddress = process.env.CONTRACTOR_ADDRESS;
    const verifierPubkeyHex = process.env.VERIFIER_PUBKEY;
    
    if (!deployerMnemonic || !ownerAddress || !contractorAddress || !verifierPubkeyHex) {
      throw new Error('Missing required environment variables');
    }
    
    // Get deployer account
    const deployerAccount = algosdk.mnemonicToSecretKey(deployerMnemonic);
    console.log('Deployer address:', deployerAccount.addr);
    
    // Initialize Algod client
    const algodToken = process.env.ALGOD_TOKEN || '';
    const algodServer = process.env.ALGOD_ADDRESS || 'https://testnet-api.4160.nodely.dev';
    const algodPort = process.env.ALGOD_PORT || '443';
    
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    
    // Check account balance
    const accountInfo = await algodClient.accountInformation(deployerAccount.addr).do();
    const balance = accountInfo.amount;
    console.log('Deployer balance:', balance, 'microAlgos');
    
    if (balance < 1000000) {
      throw new Error('Insufficient balance. Need at least 1 ALGO for deployment.');
    }
    
    // Compile contract
    console.log('Compiling contract...');
    const approvalTeal = pyteal.compileTeal(approval_program(), pyteal.Mode.Application, { version: 6 });
    const clearTeal = pyteal.compileTeal(clear_state_program(), pyteal.Mode.Application, { version: 6 });
    
    // Get suggested parameters
    const params = await algodClient.getTransactionParams().do();
    
    // Create application creation transaction
    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: deployerAccount.addr,
      suggestedParams: params,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: approvalTeal,
      clearProgram: clearTeal,
      numLocalInts: 0,
      numLocalByteSlices: 0,
      numGlobalInts: 10,
      numGlobalByteSlices: 20,
      appArgs: [
        new TextEncoder().encode(ownerAddress),
        new TextEncoder().encode(contractorAddress),
        Buffer.from(verifierPubkeyHex, 'hex')
      ]
    });
    
    // Sign and send transaction
    const signedTxn = txn.signTxn(deployerAccount.sk);
    const txId = await algodClient.sendRawTransaction(signedTxn).do();
    console.log('Transaction ID:', txId.txId);
    
    // Wait for confirmation
    console.log('Waiting for confirmation...');
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId.txId, 4);
    
    const appId = confirmedTxn['application-index'];
    const appAddress = algosdk.getApplicationAddress(appId);
    
    console.log('Contract deployed successfully!');
    console.log('Application ID:', appId);
    console.log('Application Address:', appAddress);
    
    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      appId: appId,
      appAddress: appAddress,
      deployer: deployerAccount.addr,
      owner: ownerAddress,
      contractor: contractorAddress,
      verifierPubkey: verifierPubkeyHex,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('contract-deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('Deployment info saved to contract-deployment.json');
    
    return { appId, appAddress };
  } catch (error) {
    console.error('Contract deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deployContract();
}

module.exports = { deployContract };