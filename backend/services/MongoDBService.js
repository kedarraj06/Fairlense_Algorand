// backend/services/MongoDBService.js
// MongoDB service for FairLens backend

const mongoose = require('mongoose');
// We'll use mock data when MongoDB is not available
let Tender, Project, Bid, User, BlockchainTransaction;

// Mock data storage
let mockUsers = [];
let mockTenders = [];
let mockProjects = [];
let mockBids = [];
let mockTransactions = [];
let nextId = 1;

// Helper function to generate IDs
const generateId = () => `id_${nextId++}`;

// Helper function to find items by ID in mock data
const findInMockData = (collection, id) => {
  return collection.find(item => item.id === id);
};

// Helper function to filter items in mock data
const filterMockData = (collection, filter) => {
  return collection.filter(item => {
    for (let key in filter) {
      if (item[key] !== filter[key]) {
        return false;
      }
    }
    return true;
  });
};

class MongoDBService {
  constructor() {
    this.isConnected = false;
    this.useMockData = false;
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fairlens';
      
      // Only try to connect if we have a valid MongoDB URI that's not the default local one
      if (mongoURI && mongoURI !== 'mongodb://localhost:27017/fairlens') {
        await mongoose.connect(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        // Load models only if connection is successful
        Tender = require('../models/Tender');
        Project = require('../models/Project');
        Bid = require('../models/Bid');
        User = require('../models/User');
        BlockchainTransaction = require('../models/BlockchainTransaction');

        this.isConnected = true;
        console.log('MongoDB Connected successfully');
        return { success: true };
      } else {
        console.log('Using mock data instead of MongoDB');
        this.useMockData = true;
        this.isConnected = true;
        return { success: true };
      }
    } catch (error) {
      console.error('MongoDB connection error:', error);
      console.log('Using mock data instead of MongoDB');
      this.useMockData = true;
      this.isConnected = true;
      return { success: true };
    }
  }

  async disconnect() {
    try {
      if (this.isConnected && !this.useMockData) {
        await mongoose.disconnect();
      }
      this.isConnected = false;
      console.log('MongoDB Disconnected');
      return { success: true };
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      return { success: false, error: error.message };
    }
  }

  // User operations
  async createUser(userData) {
    try {
      if (this.useMockData) {
        const user = { id: generateId(), ...userData, created_at: new Date() };
        mockUsers.push(user);
        return { success: true, user };
      } else {
        const user = new User(userData);
        await user.save();
        return { success: true, user };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserByEmail(email) {
    try {
      if (this.useMockData) {
        const user = mockUsers.find(u => u.email === email);
        return { success: true, user };
      } else {
        const user = await User.findOne({ email });
        return { success: true, user };
      }
    } catch (error) {
      console.error('Error getting user by email:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserById(id) {
    try {
      if (this.useMockData) {
        const user = mockUsers.find(u => u.id === id);
        return { success: true, user };
      } else {
        const user = await User.findById(id);
        return { success: true, user };
      }
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Tender operations
  async createTender(tenderData) {
    try {
      if (this.useMockData) {
        const tender = { id: generateId(), ...tenderData, created_at: new Date() };
        mockTenders.push(tender);
        return { success: true, tender };
      } else {
        const tender = new Tender(tenderData);
        await tender.save();
        return { success: true, tender };
      }
    } catch (error) {
      console.error('Error creating tender:', error);
      return { success: false, error: error.message };
    }
  }

  async getTenders() {
    try {
      if (this.useMockData) {
        return { success: true, tenders: mockTenders };
      } else {
        const tenders = await Tender.find().populate('government contractor');
        return { success: true, tenders };
      }
    } catch (error) {
      console.error('Error getting tenders:', error);
      return { success: false, error: error.message };
    }
  }

  async getTenderById(id) {
    try {
      if (this.useMockData) {
        const tender = mockTenders.find(t => t.id === id);
        return { success: true, tender };
      } else {
        const tender = await Tender.findById(id).populate('government contractor');
        return { success: true, tender };
      }
    } catch (error) {
      console.error('Error getting tender by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateTender(id, updateData) {
    try {
      if (this.useMockData) {
        const index = mockTenders.findIndex(t => t.id === id);
        if (index !== -1) {
          mockTenders[index] = { ...mockTenders[index], ...updateData };
          return { success: true, tender: mockTenders[index] };
        }
        return { success: false, error: 'Tender not found' };
      } else {
        const tender = await Tender.findByIdAndUpdate(id, updateData, { new: true });
        return { success: true, tender };
      }
    } catch (error) {
      console.error('Error updating tender:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTender(id) {
    try {
      if (this.useMockData) {
        const index = mockTenders.findIndex(t => t.id === id);
        if (index !== -1) {
          mockTenders.splice(index, 1);
          return { success: true };
        }
        return { success: false, error: 'Tender not found' };
      } else {
        await Tender.findByIdAndDelete(id);
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting tender:', error);
      return { success: false, error: error.message };
    }
  }

  // Project operations
  async createProject(projectData) {
    try {
      if (this.useMockData) {
        const project = { id: generateId(), ...projectData, created_at: new Date() };
        mockProjects.push(project);
        return { success: true, project };
      } else {
        const project = new Project(projectData);
        await project.save();
        return { success: true, project };
      }
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, error: error.message };
    }
  }

  async getProjects() {
    try {
      if (this.useMockData) {
        return { success: true, projects: mockProjects };
      } else {
        const projects = await Project.find().populate('tender government contractor');
        return { success: true, projects };
      }
    } catch (error) {
      console.error('Error getting projects:', error);
      return { success: false, error: error.message };
    }
  }

  async getProjectById(id) {
    try {
      if (this.useMockData) {
        const project = mockProjects.find(p => p.id === id);
        return { success: true, project };
      } else {
        const project = await Project.findById(id).populate('tender government contractor');
        return { success: true, project };
      }
    } catch (error) {
      console.error('Error getting project by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProject(id, updateData) {
    try {
      if (this.useMockData) {
        const index = mockProjects.findIndex(p => p.id === id);
        if (index !== -1) {
          mockProjects[index] = { ...mockProjects[index], ...updateData };
          return { success: true, project: mockProjects[index] };
        }
        return { success: false, error: 'Project not found' };
      } else {
        const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
        return { success: true, project };
      }
    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, error: error.message };
    }
  }

  // Bid operations
  async createBid(bidData) {
    try {
      if (this.useMockData) {
        const bid = { id: generateId(), ...bidData, created_at: new Date() };
        mockBids.push(bid);
        return { success: true, bid };
      } else {
        const bid = new Bid(bidData);
        await bid.save();
        return { success: true, bid };
      }
    } catch (error) {
      console.error('Error creating bid:', error);
      return { success: false, error: error.message };
    }
  }

  async getBids() {
    try {
      if (this.useMockData) {
        return { success: true, bids: mockBids };
      } else {
        const bids = await Bid.find().populate('tender contractor');
        return { success: true, bids };
      }
    } catch (error) {
      console.error('Error getting bids:', error);
      return { success: false, error: error.message };
    }
  }

  async getBidById(id) {
    try {
      if (this.useMockData) {
        const bid = mockBids.find(b => b.id === id);
        return { success: true, bid };
      } else {
        const bid = await Bid.findById(id).populate('tender contractor');
        return { success: true, bid };
      }
    } catch (error) {
      console.error('Error getting bid by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBid(id, updateData) {
    try {
      if (this.useMockData) {
        const index = mockBids.findIndex(b => b.id === id);
        if (index !== -1) {
          mockBids[index] = { ...mockBids[index], ...updateData };
          return { success: true, bid: mockBids[index] };
        }
        return { success: false, error: 'Bid not found' };
      } else {
        const bid = await Bid.findByIdAndUpdate(id, updateData, { new: true });
        return { success: true, bid };
      }
    } catch (error) {
      console.error('Error updating bid:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteBid(id) {
    try {
      if (this.useMockData) {
        const index = mockBids.findIndex(b => b.id === id);
        if (index !== -1) {
          mockBids.splice(index, 1);
          return { success: true };
        }
        return { success: false, error: 'Bid not found' };
      } else {
        await Bid.findByIdAndDelete(id);
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting bid:', error);
      return { success: false, error: error.message };
    }
  }

  // Blockchain transaction operations
  async createBlockchainTransaction(transactionData) {
    try {
      if (this.useMockData) {
        const transaction = { id: generateId(), ...transactionData, created_at: new Date() };
        mockTransactions.push(transaction);
        return { success: true, transaction };
      } else {
        const transaction = new BlockchainTransaction(transactionData);
        await transaction.save();
        return { success: true, transaction };
      }
    } catch (error) {
      console.error('Error creating blockchain transaction:', error);
      return { success: false, error: error.message };
    }
  }

  async getBlockchainTransactions() {
    try {
      if (this.useMockData) {
        return { success: true, transactions: mockTransactions };
      } else {
        const transactions = await BlockchainTransaction.find();
        return { success: true, transactions };
      }
    } catch (error) {
      console.error('Error getting blockchain transactions:', error);
      return { success: false, error: error.message };
    }
  }

  async getBlockchainTransactionById(id) {
    try {
      if (this.useMockData) {
        const transaction = mockTransactions.find(t => t.id === id);
        return { success: true, transaction };
      } else {
        const transaction = await BlockchainTransaction.findById(id);
        return { success: true, transaction };
      }
    } catch (error) {
      console.error('Error getting blockchain transaction by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (this.isConnected) {
        return { healthy: true, database: this.useMockData ? 'mock' : 'connected' };
      } else {
        return { healthy: false, database: 'disconnected' };
      }
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

module.exports = MongoDBService;