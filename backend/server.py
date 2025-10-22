# backend/server.py
# Node.js backend for FairLens
# Handles attestation API, indexer integration, and smart contract state management

import os
import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from algosdk import algod, account, mnemonic
from algosdk.v2client import algod as algod_v2
from algosdk.v2client import indexer
import ipfshttpclient
from verifier_sign import FairLensVerifier

app = Flask(__name__)
CORS(app)

# Configuration
ALGOD_TOKEN = os.getenv('ALGOD_TOKEN', '')
ALGOD_ADDRESS = os.getenv('ALGOD_ADDRESS', 'https://testnet-algorand.api.purestake.io/ps2')
INDEXER_TOKEN = os.getenv('INDEXER_TOKEN', '')
INDEXER_ADDRESS = os.getenv('INDEXER_ADDRESS', 'https://testnet-algorand.api.purestake.io/idx2')
IPFS_HOST = os.getenv('IPFS_HOST', '127.0.0.1')
IPFS_PORT = int(os.getenv('IPFS_PORT', '5001'))

# Initialize clients
algod_client = algod_v2.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
indexer_client = indexer.IndexerClient(INDEXER_TOKEN, INDEXER_ADDRESS)

# Initialize IPFS client
try:
    ipfs_client = ipfshttpclient.connect(f'/ip4/{IPFS_HOST}/tcp/{IPFS_PORT}/http')
except:
    ipfs_client = None
    print("Warning: IPFS client not available")

# Initialize verifier (in production, load from secure storage)
VERIFIER_PRIVATE_KEY = os.getenv('VERIFIER_PRIVATE_KEY')
if VERIFIER_PRIVATE_KEY:
    verifier = FairLensVerifier(VERIFIER_PRIVATE_KEY)
else:
    verifier = FairLensVerifier()  # Generate new key for testing
    print(f"Generated new verifier key: {verifier.get_public_key_hex()}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': int(time.time()),
        'verifier_pubkey': verifier.get_public_key_hex()
    })

@app.route('/api/attest', methods=['POST'])
def create_attestation():
    """
    Create and sign an attestation for a milestone.
    Body: {
        "app_id": 1234,
        "milestone_index": 0,
        "status": "PASS",
        "milestone_hash": "QmExampleHash",
        "proof_hash": "QmProofHash",
        "metadata": {...}
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['app_id', 'milestone_index', 'status', 'milestone_hash']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create attestation
        message, signature = verifier.sign_attestation(
            app_id=data['app_id'],
            milestone_index=data['milestone_index'],
            status=data['status'],
            milestone_hash=data['milestone_hash'],
            proof_hash=data.get('proof_hash', ''),
            timestamp=data.get('timestamp', int(time.time()))
        )
        
        # Store metadata on IPFS if available
        metadata_hash = None
        if ipfs_client and 'metadata' in data:
            try:
                metadata_json = json.dumps(data['metadata'])
                result = ipfs_client.add_str(metadata_json)
                metadata_hash = result['Hash']
            except Exception as e:
                print(f"IPFS upload failed: {e}")
        
        # Create attestation response
        attestation = {
            'app_id': data['app_id'],
            'milestone_index': data['milestone_index'],
            'status': data['status'],
            'timestamp': int(time.time()),
            'milestone_hash': data['milestone_hash'],
            'proof_hash': data.get('proof_hash', ''),
            'verifier_pubkey': verifier.get_public_key_hex(),
            'message': message.decode(),
            'signature': signature.hex(),
            'metadata_hash': metadata_hash
        }
        
        return jsonify(attestation)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/app/<int:app_id>/state', methods=['GET'])
def get_app_state(app_id):
    """Get smart contract state from Algorand Indexer."""
    try:
        # Get application info from indexer
        app_info = indexer_client.applications(app_id)
        
        if not app_info or 'application' not in app_info:
            return jsonify({'error': 'Application not found'}), 404
        
        app_data = app_info['application']
        
        # Extract global state
        global_state = {}
        if 'params' in app_data and 'global-state' in app_data['params']:
            for state in app_data['params']['global-state']:
                key = state['key']
                value = state['value']
                
                # Decode base64 key
                import base64
                decoded_key = base64.b64decode(key).decode('utf-8')
                
                # Decode value based on type
                if value['type'] == 1:  # bytes
                    decoded_value = base64.b64decode(value['bytes']).decode('utf-8')
                elif value['type'] == 2:  # uint64
                    decoded_value = value['uint']
                else:
                    decoded_value = value
                
                global_state[decoded_key] = decoded_value
        
        return jsonify({
            'app_id': app_id,
            'global_state': global_state,
            'creator': app_data.get('creator', ''),
            'created_at': app_data.get('created-at-round', 0)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/app/<int:app_id>/transactions', methods=['GET'])
def get_app_transactions(app_id):
    """Get recent transactions for an application."""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        # Get transactions from indexer
        transactions = indexer_client.search_transactions(
            application_id=app_id,
            limit=limit
        )
        
        return jsonify({
            'app_id': app_id,
            'transactions': transactions.get('transactions', []),
            'count': len(transactions.get('transactions', []))
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/verify-attestation', methods=['POST'])
def verify_attestation():
    """
    Verify an attestation signature.
    Body: {
        "message": "app:1234|ms:0|status:PASS|...",
        "signature": "hex_signature",
        "public_key": "hex_public_key"
    }
    """
    try:
        data = request.get_json()
        
        if not all(field in data for field in ['message', 'signature', 'public_key']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create verifier instance with provided public key
        from nacl.signing import VerifyKey
        from nacl.encoding import HexEncoder
        
        verify_key = VerifyKey(data['public_key'], encoder=HexEncoder)
        message_bytes = data['message'].encode('utf-8')
        signature_bytes = bytes.fromhex(data['signature'])
        
        try:
            verify_key.verify(message_bytes, signature_bytes)
            is_valid = True
        except:
            is_valid = False
        
        return jsonify({
            'valid': is_valid,
            'message': data['message'],
            'signature': data['signature']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/deploy-contract', methods=['POST'])
def deploy_contract():
    """
    Deploy a new FairLens contract.
    Body: {
        "owner_address": "ALGORAND_ADDRESS",
        "contractor_address": "ALGORAND_ADDRESS",
        "verifier_pubkey": "hex_public_key"
    }
    """
    try:
        data = request.get_json()
        
        # This is a placeholder - in production, you'd need proper key management
        # and transaction signing capabilities
        return jsonify({
            'error': 'Contract deployment requires proper key management',
            'message': 'Use the deployment scripts for contract deployment'
        }), 501
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting FairLens Backend Server...")
    print(f"Verifier Public Key: {verifier.get_public_key_hex()}")
    print(f"Algod Address: {ALGOD_ADDRESS}")
    print(f"Indexer Address: {INDEXER_ADDRESS}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
