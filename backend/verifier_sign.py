# verifier_sign.py
# Ed25519 signature generation for FairLens verifier attestations
# This module handles off-chain signature generation for AI/inspector attestations

import json
import time
from typing import Dict, Tuple
from nacl.signing import SigningKey
from nacl.encoding import HexEncoder
import hashlib

class FairLensVerifier:
    """
    Handles Ed25519 signature generation for FairLens attestations.
    In production, this should be integrated with KMS/HSM for key security.
    """
    
    def __init__(self, private_key_hex: str = None):
        """
        Initialize verifier with private key.
        If no key provided, generates a new one (for testing only).
        """
        if private_key_hex:
            self.signing_key = SigningKey(private_key_hex, encoder=HexEncoder)
        else:
            self.signing_key = SigningKey.generate()
        
        self.verify_key = self.signing_key.verify_key
        self.public_key_hex = self.verify_key.encode(encoder=HexEncoder).decode()
    
    def create_attestation_message(self, app_id: int, milestone_index: int, 
                                 status: str, timestamp: int, 
                                 milestone_hash: str, proof_hash: str = "") -> bytes:
        """
        Create a canonical attestation message for signing.
        Format: app:{app_id}|ms:{index}|status:{status}|ts:{timestamp}|hash:{milestone_hash}|proof:{proof_hash}
        """
        message = f"app:{app_id}|ms:{milestone_index}|status:{status}|ts:{timestamp}|hash:{milestone_hash}|proof:{proof_hash}"
        return message.encode('utf-8')
    
    def sign_attestation(self, app_id: int, milestone_index: int, 
                        status: str, milestone_hash: str, 
                        proof_hash: str = "", timestamp: int = None) -> Tuple[bytes, bytes]:
        """
        Sign an attestation for a milestone.
        Returns: (message_bytes, signature_bytes)
        """
        if timestamp is None:
            timestamp = int(time.time())
        
        message = self.create_attestation_message(
            app_id, milestone_index, status, timestamp, milestone_hash, proof_hash
        )
        
        signature = self.signing_key.sign(message).signature
        return message, signature
    
    def verify_attestation(self, message: bytes, signature: bytes) -> bool:
        """
        Verify an attestation signature (for testing).
        """
        try:
            self.verify_key.verify(message, signature)
            return True
        except:
            return False
    
    def get_public_key_bytes(self) -> bytes:
        """Get the 32-byte public key for smart contract storage."""
        return self.verify_key.encode()
    
    def get_public_key_hex(self) -> str:
        """Get the hex-encoded public key."""
        return self.public_key_hex

# Example usage and testing
if __name__ == "__main__":
    # Create verifier instance
    verifier = FairLensVerifier()
    
    print(f"Verifier Public Key (hex): {verifier.get_public_key_hex()}")
    print(f"Verifier Public Key (bytes): {verifier.get_public_key_bytes().hex()}")
    
    # Example attestation
    app_id = 1234
    milestone_index = 0
    status = "PASS"
    milestone_hash = "QmExampleIPFSHash123456789"
    proof_hash = "QmProofHash987654321"
    
    message, signature = verifier.sign_attestation(
        app_id, milestone_index, status, milestone_hash, proof_hash
    )
    
    print(f"\nAttestation Message: {message.decode()}")
    print(f"Signature (hex): {signature.hex()}")
    
    # Verify the signature
    is_valid = verifier.verify_attestation(message, signature)
    print(f"Signature Valid: {is_valid}")
    
    # Create JSON attestation for API
    attestation_json = {
        "app_id": app_id,
        "milestone_index": milestone_index,
        "status": status,
        "timestamp": int(time.time()),
        "milestone_hash": milestone_hash,
        "proof_hash": proof_hash,
        "verifier_pubkey": verifier.get_public_key_hex(),
        "message": message.decode(),
        "signature": signature.hex()
    }
    
    print(f"\nJSON Attestation:")
    print(json.dumps(attestation_json, indent=2))
