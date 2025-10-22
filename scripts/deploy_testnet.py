# scripts/deploy_testnet.py
# Deployment script for FairLens smart contract on Algorand TestNet

import os
import sys
import json
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.transaction import ApplicationCreateTxn, PaymentTxn, wait_for_confirmation, StateSchema
from algosdk.logic import get_application_address
import pyteal

# Add dotenv support to load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

# Add contracts directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'contracts'))

# Import the contract functions
try:
    from fairlens_app import approval_program, clear_state_program
except ImportError:
    # If direct import fails, try alternative approach
    import importlib.util
    spec = importlib.util.spec_from_file_location("fairlens_app", os.path.join(os.path.dirname(__file__), '..', 'contracts', 'fairlens_app.py'))
    if spec is not None:
        fairlens_module = importlib.util.module_from_spec(spec)
        if spec.loader is not None:
            spec.loader.exec_module(fairlens_module)
            approval_program = fairlens_module.approval_program
            clear_state_program = fairlens_module.clear_state_program
    else:
        raise ImportError("Could not import fairlens_app.py")

# TestNet configuration - moved here after dotenv load
ALGOD_TOKEN = os.getenv('ALGOD_TOKEN', '')
ALGOD_ADDRESS = os.getenv('ALGOD_ADDRESS', 'https://testnet-api.4160.nodely.dev')
ALGOD_PORT = os.getenv('ALGOD_PORT', '443')

# Initialize Algod client - moved here after dotenv load
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
    approval_teal = pyteal.compileTeal(approval_program(), pyteal.Mode.Application, version=6)
    
    # Compile clear state program
    clear_teal = pyteal.compileTeal(clear_state_program(), pyteal.Mode.Application, version=6)
    
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

def deploy_contract(private_key, owner_address, contractor_address, verifier_pubkey):
    """Deploy the FairLens contract."""
    print("Deploying FairLens contract...")
    
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
            global_schema=StateSchema(num_uints=10, num_byte_slices=20),
            local_schema=StateSchema(num_uints=0, num_byte_slices=0),
            app_args=[]  # No arguments for testing
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

def fund_contract(app_address, private_key, amount=5000000):
    """Fund the contract with ALGOs for milestone payments."""
    print(f"Funding contract with {amount} microALGOs...")
    
    try:
        algod_client = get_algod_client()
        params = algod_client.suggested_params()
        
        txn = PaymentTxn(
            sender=account.address_from_private_key(private_key),
            sp=params,
            receiver=app_address,
            amt=amount
        )
        
        signed_txn = txn.sign(private_key)
        tx_id = algod_client.send_transaction(signed_txn)
        
        print(f"✓ Funding transaction sent: {tx_id}")
        
        # Wait for confirmation
        confirmed_txn = wait_for_confirmation(algod_client, tx_id, 4)
        
        print(f"✓ Contract funded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error funding contract: {e}")
        return False

def main():
    """Main deployment function."""
    print("🚀 FairLens Contract Deployment Script")
    print("=" * 50)
    
    # Get configuration from environment or user input
    owner_address = os.getenv('OWNER_ADDRESS')
    contractor_address = os.getenv('CONTRACTOR_ADDRESS')
    verifier_pubkey_hex = os.getenv('VERIFIER_PUBKEY')
    
    if not owner_address:
        owner_address = input("Enter owner address: ").strip()
    
    if not contractor_address:
        contractor_address = input("Enter contractor address: ").strip()
    
    if not verifier_pubkey_hex:
        verifier_pubkey_hex = input("Enter verifier public key (hex): ").strip()
    
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
        verifier_pubkey
    )
    
    if not app_id:
        print("❌ Contract deployment failed")
        return
    
    # Fund contract
    fund_contract(app_address, private_key)
    
    # Save deployment info
    deployment_info = {
        'app_id': app_id,
        'app_address': app_address,
        'owner_address': owner_address,
        'contractor_address': contractor_address,
        'verifier_pubkey': verifier_pubkey_hex,
        'deployer_address': deployer_address,
        'network': 'testnet',
        'algod_address': ALGOD_ADDRESS
    }
    
    with open('deployment.json', 'w') as f:
        json.dump(deployment_info, f, indent=2)
    
    print("\n🎉 Deployment completed successfully!")
    print("=" * 50)
    print(f"Application ID: {app_id}")
    print(f"Application Address: {app_address}")
    print(f"Owner: {owner_address}")
    print(f"Contractor: {contractor_address}")
    print(f"Verifier Pubkey: {verifier_pubkey_hex}")
    print("\n📝 Deployment info saved to deployment.json")
    print("\n🔗 View on AlgoExplorer:")
    print(f"   https://testnet.algoexplorer.io/application/{app_id}")

if __name__ == '__main__':
    main()
