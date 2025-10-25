// API service for FairLens frontend
// Handles all backend API calls and authentication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    try {
      return await this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        this.setToken(response.token);
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    this.clearToken();
  }

  // Tender methods
  async getTenders() {
    try {
      return await this.request('/api/tenders');
    } catch (error) {
      console.error('Get tenders failed:', error);
      throw error;
    }
  }

  async createTender(tenderData) {
    try {
      return await this.request('/api/tenders', {
        method: 'POST',
        body: JSON.stringify(tenderData),
      });
    } catch (error) {
      console.error('Create tender failed:', error);
      throw error;
    }
  }

  async getTenderById(id) {
    try {
      return await this.request(`/api/tenders/${id}`);
    } catch (error) {
      console.error('Get tender by ID failed:', error);
      throw error;
    }
  }

  async updateTender(id, tenderData) {
    try {
      return await this.request(`/api/tenders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tenderData),
      });
    } catch (error) {
      console.error('Update tender failed:', error);
      throw error;
    }
  }

  async deleteTender(id) {
    try {
      return await this.request(`/api/tenders/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete tender failed:', error);
      throw error;
    }
  }

  // Project methods
  async getProjects() {
    try {
      return await this.request('/api/projects');
    } catch (error) {
      console.error('Get projects failed:', error);
      throw error;
    }
  }

  async getProjectById(id) {
    try {
      return await this.request(`/api/projects/${id}`);
    } catch (error) {
      console.error('Get project by ID failed:', error);
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      return await this.request('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      console.error('Create project failed:', error);
      throw error;
    }
  }

  async updateProject(id, projectData) {
    try {
      return await this.request(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      console.error('Update project failed:', error);
      throw error;
    }
  }

  // Bid methods
  async getBids() {
    try {
      return await this.request('/api/bids');
    } catch (error) {
      console.error('Get bids failed:', error);
      throw error;
    }
  }

  async createBid(bidData) {
    try {
      return await this.request('/api/bids', {
        method: 'POST',
        body: JSON.stringify(bidData),
      });
    } catch (error) {
      console.error('Create bid failed:', error);
      throw error;
    }
  }

  async updateBid(id, bidData) {
    try {
      return await this.request(`/api/bids/${id}`, {
        method: 'PUT',
        body: JSON.stringify(bidData),
      });
    } catch (error) {
      console.error('Update bid failed:', error);
      throw error;
    }
  }

  async withdrawBid(id) {
    try {
      return await this.request(`/api/bids/${id}/withdraw`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Withdraw bid failed:', error);
      throw error;
    }
  }

  // Blockchain methods
  async deployContract(contractData) {
    try {
      return await this.request('/api/blockchain/deploy-contract', {
        method: 'POST',
        body: JSON.stringify(contractData),
      });
    } catch (error) {
      console.error('Deploy contract failed:', error);
      throw error;
    }
  }

  async getContractState(contractAddress) {
    try {
      return await this.request(`/api/blockchain/contract/${contractAddress}/state`);
    } catch (error) {
      console.error('Get contract state failed:', error);
      throw error;
    }
  }

  async addMilestone(milestoneData) {
    try {
      return await this.request('/api/blockchain/add-milestone', {
        method: 'POST',
        body: JSON.stringify(milestoneData),
      });
    } catch (error) {
      console.error('Add milestone failed:', error);
      throw error;
    }
  }

  async submitMilestoneProof(proofData) {
    try {
      return await this.request('/api/blockchain/submit-proof', {
        method: 'POST',
        body: JSON.stringify(proofData),
      });
    } catch (error) {
      console.error('Submit milestone proof failed:', error);
      throw error;
    }
  }

  async verifyMilestone(verificationData) {
    try {
      return await this.request('/api/blockchain/verify-milestone', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });
    } catch (error) {
      console.error('Verify milestone failed:', error);
      throw error;
    }
  }

  // Analytics methods
  async getAnalytics() {
    try {
      return await this.request('/api/analytics/overview');
    } catch (error) {
      console.error('Get analytics failed:', error);
      throw error;
    }
  }

  async getProjectAnalytics(projectId) {
    try {
      return await this.request(`/api/analytics/projects/${projectId}`);
    } catch (error) {
      console.error('Get project analytics failed:', error);
      throw error;
    }
  }

  async getTenderAnalytics(tenderId) {
    try {
      return await this.request(`/api/analytics/tenders/${tenderId}`);
    } catch (error) {
      console.error('Get tender analytics failed:', error);
      throw error;
    }
  }

  // File upload methods
  async uploadFile(file, entityType, entityId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('entityId', entityId);

      const headers = {
        'Authorization': `Bearer ${this.token}`,
      };

      // Remove Content-Type header to let browser set it with boundary for FormData
      delete headers['Content-Type'];

      return await this.request('/api/upload', {
        method: 'POST',
        headers: headers,
        body: formData,
      });
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      return await this.request('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;