#!/usr/bin/env python3
"""
Production deployment script for FairLens smart contract.

This script deploys the FairLens contract to Algorand TestNet with proper error handling
and validation. It handles account funding, contract compilation, and deployment.

Usage:
    python deploy_production.py
"""

import os
import sys
import json
from pathlib import Path
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import ApplicationCreateTxn, PaymentTxn, StateSchema, wait_for_confirmation
from algosdk.logic import get_application_address
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_algod_client():
    """Create and return an Algod client."""
    algod_token = os.getenv('ALGOD_TOKEN', '')
    algod_address = os.getenv('ALGOD_ADDRESS', 'https://testnet-api.4160.nodely.dev')
    
    headers = {"X-API-Key": algod_token} if algod_token else {}
    return algod.AlgodClient(algod_token, algod_address, headers)

def load_deployer_account():
    """Load deployer account from mnemonic."""
    deployer_mnemonic = os.getenv('DEPLOYER_MNEMONIC')
    if not deployer_mnemonic:
        raise ValueError("DEPLOYER_MNEMONIC not found in environment variables")
    
    try:
        private_key = mnemonic.to_private_key(deployer_mnemonic)
        address = account.address_from_private_key(private_key)
        return private_key, address
    except Exception as e:
        raise ValueError(f"Invalid deployer mnemonic: {e}")

def check_account_balance(address, min_balance=1000000):
    """Check if account has sufficient balance."""
    client = get_algod_client()
    try:
        account_info = client.account_info(address)
        if isinstance(account_info, dict):
            balance = account_info.get('amount', 0)
        else:
            balance = 0
        print(f"Account balance: {balance} microALGOs")
        return balance >= min_balance
    except Exception as e:
        print(f"Error checking account balance: {e}")
        return False

def load_contract_teal():
    """Load compiled TEAL contract files."""
    # Try to compile if TEAL files don't exist
    if not os.path.exists("fairlens_approval.teal") or not os.path.exists("fairlens_clear.teal"):
        print("Compiling contract...")
        try:
            # Import and compile the contract
            sys.path.append(os.path.join(os.path.dirname(__file__), 'contracts'))
            from production_contract import fairlens_approval_program, fairlens_clear_state_program
            from pyteal import compileTeal, Mode
            
            approval_teal = compileTeal(fairlens_approval_program(), Mode.Application, version=6)
            clear_teal = compileTeal(fairlens_clear_state_program(), Mode.Application, version=6)
            
            # Save to files
            with open("fairlens_approval.teal", "w") as f:
                f.write(approval_teal)
            with open("fairlens_clear.teal", "w") as f:
                f.write(clear_teal)
                
            print("✅ Contract compiled and saved")
        except Exception as e:
            raise RuntimeError(f"Failed to compile contract: {e}")
    
    # Load TEAL files
    try:
        with open("fairlens_approval.teal", "r") as f:
            approval_teal = f.read()
        with open("fairlens_clear.teal", "r") as f:
            clear_teal = f.read()
        return approval_teal, clear_teal
    except Exception as e:
        raise RuntimeError(f"Failed to load TEAL files: {e}")

def deploy_contract(private_key, owner_address, contractor_address, verifier_pubkey):
    """Deploy the FairLens contract to Algorand."""
    client = get_algod_client()
    
    # Load compiled contract
    approval_teal, clear_teal = load_contract_teal()
    
    # Get suggested parameters
    params = client.suggested_params()
    
    # Prepare application arguments
    app_args = [
        owner_address.encode('utf-8'),
        contractor_address.encode('utf-8'),
        verifier_pubkey
    ]
    
    # Define state schema
    global_schema = StateSchema(num_uints=10, num_byte_slices=20)
    local_schema = StateSchema(num_uints=0, num_byte_slices=0)
    
    # Create application creation transaction
    txn = ApplicationCreateTxn(
        sender=account.address_from_private_key(private_key),
        sp=params,
        on_complete=0,  # NoOp
        approval_program=approval_teal,
        clear_program=clear_teal,
        global_schema=global_schema,
        local_schema=local_schema,
        app_args=app_args
    )
    
    # Sign and send transaction
    signed_txn = txn.sign(private_key)
    tx_id = client.send_transaction(signed_txn)
    
    print(f"Transaction sent: {tx_id}")
    
    # Wait for confirmation
    confirmed_txn = wait_for_confirmation(client, tx_id, 4)
    app_id = confirmed_txn['application-index']
    app_address = get_application_address(app_id)
    
    return app_id, app_address

def fund_contract(private_key, app_address, amount=5000000):
    """Fund the contract with ALGOs for milestone payments."""
    client = get_algod_client()
    params = client.suggested_params()
    
    # Create payment transaction
    txn = PaymentTxn(
        sender=account.address_from_private_key(private_key),
        sp=params,
        receiver=app_address,
        amt=amount
    )
    
    # Sign and send transaction
    signed_txn = txn.sign(private_key)
    tx_id = client.send_transaction(signed_txn)
    
    print(f"Funding transaction sent: {tx_id}")
    
    # Wait for confirmation
    wait_for_confirmation(client, tx_id, 4)
    return True

def main():
    """Main deployment function."""
    print("🚀 FairLens Production Deployment")
    print("=" * 50)
    
    try:
        # Load environment variables
        owner_address = os.getenv('OWNER_ADDRESS', '')
        contractor_address = os.getenv('CONTRACTOR_ADDRESS', '')
        verifier_pubkey_hex = os.getenv('VERIFIER_PUBKEY', '')
        
        if not all([owner_address, contractor_address, verifier_pubkey_hex]):
            print("❌ Missing required environment variables")
            print("Please ensure OWNER_ADDRESS, CONTRACTOR_ADDRESS, and VERIFIER_PUBKEY are set in .env")
            return
        
        # Convert verifier pubkey
        if verifier_pubkey_hex:
            verifier_pubkey = bytes.fromhex(verifier_pubkey_hex)
            if len(verifier_pubkey) != 32:
                raise ValueError("Verifier public key must be 32 bytes")
        else:
            raise ValueError("VERIFIER_PUBKEY not found in environment variables")

        # Load deployer account
        private_key, deployer_address = load_deployer_account()
        print(f"Deployer account: {deployer_address}")
        
        # Check account balance
        if not check_account_balance(deployer_address):
            print("❌ Insufficient balance. Please fund the deployer account.")
            print("Use the Algorand TestNet dispenser: https://testnet.algoexplorer.io/dispenser")
            return
        
        print("✅ Sufficient balance")
        
        # Deploy contract
        print("Deploying contract...")
        app_id, app_address = deploy_contract(
            private_key, 
            owner_address, 
            contractor_address, 
            verifier_pubkey
        )
        
        print(f"✅ Contract deployed successfully!")
        print(f"   Application ID: {app_id}")
        print(f"   Application Address: {app_address}")
        
        # Fund contract
        print("Funding contract...")
        fund_contract(private_key, app_address)
        print("✅ Contract funded successfully!")
        
        # Save deployment info
        deployment_info = {
            'app_id': app_id,
            'app_address': app_address,
            'owner_address': owner_address,
            'contractor_address': contractor_address,
            'verifier_pubkey': verifier_pubkey_hex,
            'deployer_address': deployer_address,
            'network': 'testnet',
            'timestamp': str(datetime.datetime.now())
        }
        
        with open('deployment_info.json', 'w') as f:
            json.dump(deployment_info, f, indent=2)
        
        print(f"\n🎉 Deployment completed successfully!")
        print("=" * 50)
        print(f"Application ID: {app_id}")
        print(f"Application Address: {app_address}")
        print(f"Deployment info saved to deployment_info.json")
        print(f"\nView on AlgoExplorer: https://testnet.algoexplorer.io/application/{app_id}")
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    import datetime
    main()