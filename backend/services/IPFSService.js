// backend/services/IPFSService.js
// IPFS integration service for storing metadata and proofs

// IPFS client - using dynamic import to handle ESM module
let ipfsClient = null;

class IPFSService {
  constructor() {
    this.ipfsHost = process.env.IPFS_HOST || '127.0.0.1';
    this.ipfsPort = process.env.IPFS_PORT || '5001';
    this.ipfsProtocol = process.env.IPFS_PROTOCOL || 'http';
    
    this.client = null;
    // Initialize IPFS client asynchronously
    this.initializeClient().catch(console.error);
  }

  async initializeClient() {
    try {
      const { create } = await import('ipfs-http-client');
      const url = `${this.ipfsProtocol}://${this.ipfsHost}:${this.ipfsPort}`;
      this.client = create({ url });
      console.log(`IPFS client initialized: ${url}`);
    } catch (error) {
      console.warn('IPFS client initialization failed:', error.message);
      this.client = null;
    }
  }

  async isAvailable() {
    if (!this.client) {
      return false;
    }

    try {
      const version = await this.client.version();
      return !!version;
    } catch (error) {
      console.warn('IPFS health check failed:', error.message);
      return false;
    }
  }

  async addJSON(data) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const result = await this.client.add(jsonString);
      return result.path;
    } catch (error) {
      console.error('Error adding JSON to IPFS:', error);
      throw error;
    }
  }

  async addBuffer(buffer) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      const result = await this.client.add(buffer);
      return result.path;
    } catch (error) {
      console.error('Error adding buffer to IPFS:', error);
      throw error;
    }
  }

  async addString(text) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      const result = await this.client.add(text);
      return result.path;
    } catch (error) {
      console.error('Error adding string to IPFS:', error);
      throw error;
    }
  }

  async getJSON(hash) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting JSON from IPFS:', error);
      throw error;
    }
  }

  async getString(hash) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks).toString();
    } catch (error) {
      console.error('Error getting string from IPFS:', error);
      throw error;
    }
  }

  async getBuffer(hash) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      const chunks = [];
      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Error getting buffer from IPFS:', error);
      throw error;
    }
  }

  async pin(hash) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      await this.client.pin.add(hash);
      return true;
    } catch (error) {
      console.error('Error pinning to IPFS:', error);
      throw error;
    }
  }

  async unpin(hash) {
    if (!this.client) {
      throw new Error('IPFS client not available');
    }

    try {
      await this.client.pin.rm(hash);
      return true;
    } catch (error) {
      console.error('Error unpinning from IPFS:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (!this.client) {
        return {
          healthy: false,
          error: 'IPFS client not initialized'
        };
      }

      const version = await this.client.version();
      return {
        healthy: true,
        version: version.version,
        commit: version.commit
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = IPFSService;
