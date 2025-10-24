// backend/services/MongoDBService.js
// MongoDB service for FairLens backend

const mongoose = require('mongoose');
const Tender = require('../models/Tender');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const User = require('../models/User');
const BlockchainTransaction = require('../models/BlockchainTransaction');

class MongoDBService {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fairlens';
      
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      console.log('MongoDB Connected successfully');
      return { success: true };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
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
      const user = new User(userData);
      await user.save();
      return { success: true, user };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return { success: true, user };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id);
      return { success: true, user };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Tender operations
  async createTender(tenderData) {
    try {
      const tender = new Tender(tenderData);
      await tender.save();
      return { success: true, tender };
    } catch (error) {
      console.error('Error creating tender:', error);
      return { success: false, error: error.message };
    }
  }

  async getTenders() {
    try {
      const tenders = await Tender.find().populate('government contractor');
      return { success: true, tenders };
    } catch (error) {
      console.error('Error getting tenders:', error);
      return { success: false, error: error.message };
    }
  }

  async getTenderById(id) {
    try {
      const tender = await Tender.findById(id).populate('government contractor');
      return { success: true, tender };
    } catch (error) {
      console.error('Error getting tender by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateTender(id, updateData) {
    try {
      const tender = await Tender.findByIdAndUpdate(id, updateData, { new: true });
      return { success: true, tender };
    } catch (error) {
      console.error('Error updating tender:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteTender(id) {
    try {
      await Tender.findByIdAndDelete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting tender:', error);
      return { success: false, error: error.message };
    }
  }

  // Project operations
  async createProject(projectData) {
    try {
      const project = new Project(projectData);
      await project.save();
      return { success: true, project };
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, error: error.message };
    }
  }

  async getProjects() {
    try {
      const projects = await Project.find().populate('tender government contractor');
      return { success: true, projects };
    } catch (error) {
      console.error('Error getting projects:', error);
      return { success: false, error: error.message };
    }
  }

  async getProjectById(id) {
    try {
      const project = await Project.findById(id).populate('tender government contractor');
      return { success: true, project };
    } catch (error) {
      console.error('Error getting project by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProject(id, updateData) {
    try {
      const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
      return { success: true, project };
    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, error: error.message };
    }
  }

  // Bid operations
  async createBid(bidData) {
    try {
      const bid = new Bid(bidData);
      await bid.save();
      return { success: true, bid };
    } catch (error) {
      console.error('Error creating bid:', error);
      return { success: false, error: error.message };
    }
  }

  async getBids() {
    try {
      const bids = await Bid.find().populate('tender contractor');
      return { success: true, bids };
    } catch (error) {
      console.error('Error getting bids:', error);
      return { success: false, error: error.message };
    }
  }

  async getBidById(id) {
    try {
      const bid = await Bid.findById(id).populate('tender contractor');
      return { success: true, bid };
    } catch (error) {
      console.error('Error getting bid by ID:', error);
      return { success: false, error: error.message };
    }
  }

  async updateBid(id, updateData) {
    try {
      const bid = await Bid.findByIdAndUpdate(id, updateData, { new: true });
      return { success: true, bid };
    } catch (error) {
      console.error('Error updating bid:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteBid(id) {
    try {
      await Bid.findByIdAndDelete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting bid:', error);
      return { success: false, error: error.message };
    }
  }

  // Blockchain transaction operations
  async createBlockchainTransaction(transactionData) {
    try {
      const transaction = new BlockchainTransaction(transactionData);
      await transaction.save();
      return { success: true, transaction };
    } catch (error) {
      console.error('Error creating blockchain transaction:', error);
      return { success: false, error: error.message };
    }
  }

  async getBlockchainTransactions() {
    try {
      const transactions = await BlockchainTransaction.find();
      return { success: true, transactions };
    } catch (error) {
      console.error('Error getting blockchain transactions:', error);
      return { success: false, error: error.message };
    }
  }

  async getBlockchainTransactionById(id) {
    try {
      const transaction = await BlockchainTransaction.findById(id);
      return { success: true, transaction };
    } catch (error) {
      console.error('Error getting blockchain transaction by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Health check
  async healthCheck() {
    try {
      if (this.isConnected) {
        return { healthy: true, database: 'connected' };
      } else {
        return { healthy: false, database: 'disconnected' };
      }
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

module.exports = MongoDBService;