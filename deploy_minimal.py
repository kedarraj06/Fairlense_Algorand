import os
import sys
import json
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import ApplicationCreateTxn, PaymentTxn, wait_for_confirmation, StateSchema
from algosdk.logic import get_application_address
import pyteal
from dotenv import load_dotenv
load_dotenv()

# Add contracts directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'contracts'))

# Import the minimal contract
from minimal_contract import minimal_approval, minimal_clear

# TestNet configuration
ALGOD_TOKEN = os.getenv('ALGOD_TOKEN', '')
ALGOD_ADDRESS = os.getenv('ALGOD_ADDRESS', 'https://testnet-api.4160.nodely.dev')
ALGOD_PORT = os.getenv('ALGOD_PORT', '443')

def get_algod_client():
    """Get Algod client with proper headers for public nodes."""
    headers = {
        "X-API-Key": ALGOD_TOKEN,
    } if ALGOD_TOKEN else {}
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS, headers=headers)

def compile_contract():
    """Compile PyTeal contract to TEAL."""
    print("Compiling PyTeal contract...")
    
    # Compile approval program
    approval_teal = pyteal.compileTeal(minimal_approval(), pyteal.Mode.Application, version=6)
    
    # Compile clear state program
    clear_teal = pyteal.compileTeal(minimal_clear(), pyteal.Mode.Application, version=6)
    
    print("✓ Contract compiled successfully")
    return approval_teal, clear_teal

def create_deployer_account():
    """Create or load deployer account."""
    print("Setting up deployer account...")
    
    # Try to load from environment
    deployer_mnemonic = os.getenv('DEPLOYER_MNEMONIC')
    if deployer_mnemonic:
        try:
            private_key = mnemonic.to_private_key(deployer_mnemonic)
            address = account.address_from_private_key(private_key)
            print(f"✓ Loaded deployer account: {address}")
            return private_key, address
        except Exception as e:
            print(f"Error loading deployer mnemonic: {e}")
    
    # Generate new account for testing
    print("⚠️  No deployer mnemonic found. Generating new account for testing...")
    private_key, address = account.generate_account()
    deployer_mnemonic = mnemonic.from_private_key(private_key)
    
    print(f"✓ Generated new deployer account: {address}")
    print(f"⚠️  IMPORTANT: Save this mnemonic for future use:")
    print(f"   DEPLOYER_MNEMONIC='{deployer_mnemonic}'")
    print(f"   You'll need ALGOs in this account to deploy the contract.")
    print(f"   Get testnet ALGOs from: https://testnet.algoexplorer.io/dispenser")
    
    return private_key, address

def fund_account(address, amount=1000000):
    """Fund account with testnet ALGOs (placeholder - requires manual funding)."""
    print(f"⚠️  Please fund account {address} with at least {amount} microALGOs")
    print(f"   Use the testnet dispenser: https://testnet.algoexplorer.io/dispenser")
    
    # Check account balance
    try:
        algod_client = get_algod_client()
        account_info = algod_client.account_info(address)
        # Fix: account_info is a dict, not bytes
        balance = account_info.get('amount', 0) if isinstance(account_info, dict) else 0
        print(f"   Current balance: {balance} microALGOs")
        
        if balance < amount:
            print(f"   ❌ Insufficient balance. Need {amount} microALGOs")
            return False
        else:
            print(f"   ✓ Sufficient balance")
            return True
    except Exception as e:
        print(f"   ❌ Error checking balance: {e}")
        return False

def deploy_contract(private_key, owner_address, contractor_address, verifier_pubkey_hex):
    """Deploy the minimal contract."""
    print("Deploying minimal contract...")
    
    try:
        algod_client = get_algod_client()
        # Get suggested parameters
        params = algod_client.suggested_params()
        
        # Compile contract
        approval_teal, clear_teal = compile_contract()
        
        # Create application creation transaction
        txn = ApplicationCreateTxn(
            sender=account.address_from_private_key(private_key),
            sp=params,
            on_complete=0,  # NoOp
            approval_program=approval_teal,
            clear_program=clear_teal,
            global_schema=StateSchema(num_uints=0, num_byte_slices=0),  # No global state
            local_schema=StateSchema(num_uints=0, num_byte_slices=0),
            app_args=[]  # No arguments
        )
        
        # Sign and send transaction
        signed_txn = txn.sign(private_key)
        tx_id = algod_client.send_transaction(signed_txn)
        
        print(f"✓ Contract deployment transaction sent: {tx_id}")
        
        # Wait for confirmation
        print("Waiting for confirmation...")
        confirmed_txn = wait_for_confirmation(algod_client, tx_id, 4)
        
        app_id = confirmed_txn['application-index']
        app_address = get_application_address(app_id)
        
        print(f"✓ Contract deployed successfully!")
        print(f"   Application ID: {app_id}")
        print(f"   Application Address: {app_address}")
        
        return app_id, app_address
        
    except Exception as e:
        print(f"❌ Error deploying contract: {e}")
        return None, None

def main():
    """Main deployment function."""
    print("🚀 Minimal Contract Deployment Script")
    print("=" * 50)
    
    # Get configuration from environment
    owner_address = os.getenv('OWNER_ADDRESS', 'RI4L5XJSRDUPNW7ZFEXFTJ2WWFI2MC2WNFXLL6HSZ2PLHRVSOWSGKO2DSM')
    contractor_address = os.getenv('CONTRACTOR_ADDRESS', 'ITSTYRW6UURLHKDIKT5HD7AUOPD73TGE72YZBMAMCVDEMKDXQZS6YFCTQQ')
    verifier_pubkey_hex = os.getenv('VERIFIER_PUBKEY', 'daefbc974139e218b638f621f50d02ce47011cc817d3df11d6298615114d8fb6')
    
    # Convert verifier pubkey to bytes
    try:
        verifier_pubkey = bytes.fromhex(verifier_pubkey_hex)
        if len(verifier_pubkey) != 32:
            raise ValueError("Verifier public key must be 32 bytes")
    except Exception as e:
        print(f"❌ Invalid verifier public key: {e}")
        return
    
    # Create deployer account
    private_key, deployer_address = create_deployer_account()
    
    # Check if account is funded
    if not fund_account(deployer_address):
        print("❌ Please fund the deployer account and try again")
        return
    
    # Deploy contract
    app_id, app_address = deploy_contract(
        private_key, 
        owner_address, 
        contractor_address, 
        verifier_pubkey_hex  # Pass as hex string instead of bytes
    )
    
    if not app_id:
        print("❌ Contract deployment failed")
        return
    
    print("\n🎉 Deployment completed successfully!")
    print("=" * 50)
    print(f"Application ID: {app_id}")
    print(f"Application Address: {app_address}")

if __name__ == '__main__':
    main()