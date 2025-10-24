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
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    this.clearToken();
  }

  // Tender methods
  async getTenders() {
    return this.request('/api/tenders');
  }

  async createTender(tenderData) {
    return this.request('/api/tenders', {
      method: 'POST',
      body: JSON.stringify(tenderData),
    });
  }

  async getTenderById(id) {
    return this.request(`/api/tenders/${id}`);
  }

  async updateTender(id, tenderData) {
    return this.request(`/api/tenders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenderData),
    });
  }

  async deleteTender(id) {
    return this.request(`/api/tenders/${id}`, {
      method: 'DELETE',
    });
  }

  // Project methods
  async getProjects() {
    return this.request('/api/projects');
  }

  async getProjectById(id) {
    return this.request(`/api/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  // Bid methods
  async getBids() {
    return this.request('/api/bids');
  }

  async createBid(bidData) {
    return this.request('/api/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  async updateBid(id, bidData) {
    return this.request(`/api/bids/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bidData),
    });
  }

  async withdrawBid(id) {
    return this.request(`/api/bids/${id}/withdraw`, {
      method: 'POST',
    });
  }

  // Blockchain methods
  async deployContract(contractData) {
    return this.request('/api/blockchain/deploy-contract', {
      method: 'POST',
      body: JSON.stringify(contractData),
    });
  }

  async getContractState(contractAddress) {
    return this.request(`/api/blockchain/contract/${contractAddress}/state`);
  }

  async addMilestone(milestoneData) {
    return this.request('/api/blockchain/add-milestone', {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  }

  async submitMilestoneProof(proofData) {
    return this.request('/api/blockchain/submit-proof', {
      method: 'POST',
      body: JSON.stringify(proofData),
    });
  }

  async verifyMilestone(verificationData) {
    return this.request('/api/blockchain/verify-milestone', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  // Analytics methods
  async getAnalytics() {
    return this.request('/api/analytics/overview');
  }

  async getProjectAnalytics(projectId) {
    return this.request(`/api/analytics/projects/${projectId}`);
  }

  async getTenderAnalytics(tenderId) {
    return this.request(`/api/analytics/tenders/${tenderId}`);
  }

  // File upload methods
  async uploadFile(file, entityType, entityId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);

    return this.request('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;