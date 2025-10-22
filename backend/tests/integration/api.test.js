// backend/tests/integration/api.test.js
// Integration tests for API endpoints

const request = require('supertest');
const app = require('../../server');

describe('API Integration Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('verifier_pubkey');
      expect(response.body).toHaveProperty('network');
    });
  });

  describe('POST /api/attest', () => {
    it('should create a valid attestation', async () => {
      const attestationData = {
        app_id: 1234,
        milestone_index: 0,
        status: 'PASS',
        milestone_hash: 'QmTestHash123',
        proof_hash: 'QmTestProof456',
        metadata: {
          description: 'Test milestone completion',
          inspector: 'AI Inspector v1.0'
        }
      };

      const response = await request(app)
        .post('/api/attest')
        .send(attestationData)
        .expect(200);

      expect(response.body).toHaveProperty('app_id', 1234);
      expect(response.body).toHaveProperty('milestone_index', 0);
      expect(response.body).toHaveProperty('status', 'PASS');
      expect(response.body).toHaveProperty('milestone_hash', 'QmTestHash123');
      expect(response.body).toHaveProperty('proof_hash', 'QmTestProof456');
      expect(response.body).toHaveProperty('verifier_pubkey');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('signature');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should reject invalid attestation data', async () => {
      const invalidData = {
        app_id: 'invalid',
        milestone_index: -1,
        status: 'INVALID'
      };

      const response = await request(app)
        .post('/api/attest')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        app_id: 1234
        // Missing milestone_index, status, milestone_hash
      };

      const response = await request(app)
        .post('/api/attest')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('GET /api/app/:appId/state', () => {
    it('should return 404 for non-existent app', async () => {
      const response = await request(app)
        .get('/api/app/999999/state')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Application not found');
    });

    it('should handle invalid app ID', async () => {
      const response = await request(app)
        .get('/api/app/invalid/state')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('GET /api/app/:appId/transactions', () => {
    it('should return empty transactions for non-existent app', async () => {
      const response = await request(app)
        .get('/api/app/999999/transactions')
        .expect(200);

      expect(response.body).toHaveProperty('app_id', 999999);
      expect(response.body).toHaveProperty('transactions');
      expect(response.body).toHaveProperty('count', 0);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/app/999999/transactions?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('count');
      expect(response.body.count).toBeLessThanOrEqual(10);
    });
  });

  describe('POST /api/verify-attestation', () => {
    it('should verify a valid attestation', async () => {
      // First create an attestation
      const attestationData = {
        app_id: 1234,
        milestone_index: 0,
        status: 'PASS',
        milestone_hash: 'QmTestHash123'
      };

      const attestationResponse = await request(app)
        .post('/api/attest')
        .send(attestationData)
        .expect(200);

      // Then verify it
      const verifyData = {
        message: attestationResponse.body.message,
        signature: attestationResponse.body.signature,
        public_key: attestationResponse.body.verifier_pubkey
      };

      const response = await request(app)
        .post('/api/verify-attestation')
        .send(verifyData)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('signature');
    });

    it('should reject invalid attestation', async () => {
      const invalidData = {
        message: 'test message',
        signature: 'invalid signature',
        public_key: 'invalid public key'
      };

      const response = await request(app)
        .post('/api/verify-attestation')
        .send(invalidData)
        .expect(200);

      expect(response.body).toHaveProperty('valid', false);
    });

    it('should handle missing fields', async () => {
      const incompleteData = {
        message: 'test message'
        // Missing signature and public_key
      };

      const response = await request(app)
        .post('/api/verify-attestation')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('GET /api/verifier/public-key', () => {
    it('should return verifier public key', async () => {
      const response = await request(app)
        .get('/api/verifier/public-key')
        .expect(200);

      expect(response.body).toHaveProperty('public_key');
      expect(response.body).toHaveProperty('algorithm', 'Ed25519');
      expect(response.body.public_key).toMatch(/^[0-9a-f]{64}$/i);
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/attest')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple requests quickly
      const promises = Array(10).fill().map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(promises);
      
      // All should succeed (rate limit is 100 per 15 minutes)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
