// backend/services/VerifierService.js
// Ed25519 signature generation for FairLens verifier attestations

const tweetnacl = require('tweetnacl');

class VerifierService {
  constructor() {
    // Load private key from environment or generate new one
    const privateKeyHex = process.env.VERIFIER_PRIVATE_KEY;
    
    if (privateKeyHex) {
      try {
        this.privateKey = Buffer.from(privateKeyHex, 'hex');
        if (this.privateKey.length !== 32) {
          throw new Error('Private key must be 32 bytes');
        }
      } catch (error) {
        console.warn('Invalid private key in environment, generating new one:', error.message);
        this.generateNewKeyPair();
      }
    } else {
      console.warn('No VERIFIER_PRIVATE_KEY found in environment, generating new key pair');
      this.generateNewKeyPair();
    }
    
    this.publicKey = tweetnacl.sign.keyPair.fromSecretKey(this.privateKey).publicKey;
  }

  generateNewKeyPair() {
    const keyPair = tweetnacl.sign.keyPair();
    this.privateKey = keyPair.secretKey;
    this.publicKey = keyPair.publicKey;
    
    console.log('Generated new verifier key pair:');
    console.log(`Private Key: ${Buffer.from(this.privateKey).toString('hex')}`);
    console.log(`Public Key: ${Buffer.from(this.publicKey).toString('hex')}`);
    console.log('⚠️  IMPORTANT: Save these keys for production use!');
  }

  createAttestationMessage(appId, milestoneIndex, status, timestamp, milestoneHash, proofHash = '') {
    return `app:${appId}|ms:${milestoneIndex}|status:${status}|ts:${timestamp}|hash:${milestoneHash}|proof:${proofHash}`;
  }

  createAttestation(data) {
    const {
      app_id,
      milestone_index,
      status,
      milestone_hash,
      proof_hash = '',
      timestamp
    } = data;

    const message = this.createAttestationMessage(
      app_id,
      milestone_index,
      status,
      timestamp,
      milestone_hash,
      proof_hash
    );

    const messageBytes = Buffer.from(message, 'utf8');
    const signature = tweetnacl.sign.detached(messageBytes, this.privateKey);

    return {
      app_id,
      milestone_index,
      status,
      timestamp,
      milestone_hash,
      proof_hash,
      verifier_pubkey: Buffer.from(this.publicKey).toString('hex'),
      message,
      signature: Buffer.from(signature).toString('hex')
    };
  }

  verifyAttestation(messageBytes, signatureBytes, publicKeyBytes) {
    try {
      return tweetnacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKeyBytes
      );
    } catch (error) {
      return false;
    }
  }

  getPublicKeyBytes() {
    return Buffer.from(this.publicKey);
  }

  getPublicKeyHex() {
    return Buffer.from(this.publicKey).toString('hex');
  }

  getPrivateKeyHex() {
    return Buffer.from(this.privateKey).toString('hex');
  }
}

module.exports = VerifierService;
