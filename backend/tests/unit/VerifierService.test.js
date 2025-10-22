// backend/tests/unit/VerifierService.test.js
// Unit tests for VerifierService

const VerifierService = require('../../services/VerifierService');

describe('VerifierService', () => {
  let verifierService;

  beforeEach(() => {
    // Create a new instance for each test
    verifierService = new VerifierService();
  });

  describe('constructor', () => {
    it('should create a new key pair when no private key is provided', () => {
      expect(verifierService.privateKey).toBeDefined();
      expect(verifierService.publicKey).toBeDefined();
      expect(verifierService.privateKey.length).toBe(32);
      expect(verifierService.publicKey.length).toBe(32);
    });

    it('should use provided private key when available', () => {
      const privateKeyHex = 'a'.repeat(64); // 32 bytes in hex
      process.env.VERIFIER_PRIVATE_KEY = privateKeyHex;
      
      const service = new VerifierService();
      expect(Buffer.from(service.privateKey).toString('hex')).toBe(privateKeyHex);
      
      // Clean up
      delete process.env.VERIFIER_PRIVATE_KEY;
    });
  });

  describe('createAttestationMessage', () => {
    it('should create a properly formatted message', () => {
      const message = verifierService.createAttestationMessage(
        1234, 0, 'PASS', 1234567890, 'QmHash123', 'QmProof456'
      );

      expect(message).toBe('app:1234|ms:0|status:PASS|ts:1234567890|hash:QmHash123|proof:QmProof456');
    });

    it('should handle empty proof hash', () => {
      const message = verifierService.createAttestationMessage(
        1234, 0, 'PASS', 1234567890, 'QmHash123', ''
      );

      expect(message).toBe('app:1234|ms:0|status:PASS|ts:1234567890|hash:QmHash123|proof:');
    });
  });

  describe('createAttestation', () => {
    it('should create a valid attestation', () => {
      const data = {
        app_id: 1234,
        milestone_index: 0,
        status: 'PASS',
        milestone_hash: 'QmHash123',
        proof_hash: 'QmProof456',
        timestamp: 1234567890
      };

      const attestation = verifierService.createAttestation(data);

      expect(attestation).toHaveProperty('app_id', 1234);
      expect(attestation).toHaveProperty('milestone_index', 0);
      expect(attestation).toHaveProperty('status', 'PASS');
      expect(attestation).toHaveProperty('milestone_hash', 'QmHash123');
      expect(attestation).toHaveProperty('proof_hash', 'QmProof456');
      expect(attestation).toHaveProperty('timestamp', 1234567890);
      expect(attestation).toHaveProperty('verifier_pubkey');
      expect(attestation).toHaveProperty('message');
      expect(attestation).toHaveProperty('signature');
    });

    it('should create a verifiable signature', () => {
      const data = {
        app_id: 1234,
        milestone_index: 0,
        status: 'PASS',
        milestone_hash: 'QmHash123',
        proof_hash: 'QmProof456',
        timestamp: 1234567890
      };

      const attestation = verifierService.createAttestation(data);
      
      const isValid = verifierService.verifyAttestation(
        Buffer.from(attestation.message, 'utf8'),
        Buffer.from(attestation.signature, 'hex'),
        Buffer.from(attestation.verifier_pubkey, 'hex')
      );

      expect(isValid).toBe(true);
    });
  });

  describe('verifyAttestation', () => {
    it('should verify a valid signature', () => {
      const data = {
        app_id: 1234,
        milestone_index: 0,
        status: 'PASS',
        milestone_hash: 'QmHash123',
        proof_hash: 'QmProof456',
        timestamp: 1234567890
      };

      const attestation = verifierService.createAttestation(data);
      
      const isValid = verifierService.verifyAttestation(
        Buffer.from(attestation.message, 'utf8'),
        Buffer.from(attestation.signature, 'hex'),
        Buffer.from(attestation.verifier_pubkey, 'hex')
      );

      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature', () => {
      const message = Buffer.from('test message', 'utf8');
      const signature = Buffer.from('invalid signature', 'hex');
      const publicKey = verifierService.getPublicKeyBytes();

      const isValid = verifierService.verifyAttestation(message, signature, publicKey);
      expect(isValid).toBe(false);
    });

    it('should handle malformed input gracefully', () => {
      const isValid = verifierService.verifyAttestation(
        Buffer.from('test', 'utf8'),
        Buffer.from('invalid', 'hex'),
        Buffer.from('invalid', 'hex')
      );

      expect(isValid).toBe(false);
    });
  });

  describe('getPublicKeyHex', () => {
    it('should return a hex string of the public key', () => {
      const publicKeyHex = verifierService.getPublicKeyHex();
      
      expect(typeof publicKeyHex).toBe('string');
      expect(publicKeyHex.length).toBe(64); // 32 bytes = 64 hex chars
      expect(/^[0-9a-f]+$/i.test(publicKeyHex)).toBe(true);
    });
  });

  describe('getPublicKeyBytes', () => {
    it('should return a Buffer of the public key', () => {
      const publicKeyBytes = verifierService.getPublicKeyBytes();
      
      expect(Buffer.isBuffer(publicKeyBytes)).toBe(true);
      expect(publicKeyBytes.length).toBe(32);
    });
  });
});
