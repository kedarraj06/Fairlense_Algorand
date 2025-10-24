// scripts/init-mongodb.js
// Script to initialize MongoDB database for FairLens

const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fairlens';

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['government', 'contractor', 'citizen'] },
  name: { type: String, required: true },
  wallet_address: { type: String },
  phone: { type: String },
  organization: { type: String },
  created_at: { type: Date, default: Date.now }
});

// Tender schema
const tenderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true, min: 0 },
  deadline: { type: Date, required: true },
  requirements: [{ type: String }],
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
    status: { type: String, enum: ['pending', 'submitted', 'approved', 'paid'], default: 'pending' }
  }],
  government: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'closed', 'awarded', 'cancelled'], default: 'open' },
  contractAddress: { type: String },
  blockchainDeployed: { type: Boolean, default: false },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String }],
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  }
}, {
  timestamps: true
});

// Project schema
const projectSchema = new mongoose.Schema({
  tender: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender', required: true },
  government: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  budget: { type: Number, required: true, min: 0 },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  contractAddress: String,
  blockchainDeployed: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Bid schema
const bidSchema = new mongoose.Schema({
  tender: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender', required: true },
  contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 },
  proposal: { type: String, required: true },
  timeline: { type: Number, required: true }, // in days
  status: { type: String, enum: ['submitted', 'accepted', 'rejected', 'withdrawn'], default: 'submitted' },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Blockchain transaction schema
const blockchainTransactionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  tender: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender' },
  milestone: { type: mongoose.Schema.Types.ObjectId },
  transactionHash: { type: String, unique: true, required: true },
  transactionType: { type: String, required: true, enum: ['payment', 'milestone', 'verification'] },
  amount: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
  blockNumber: Number,
  gasUsed: Number,
  confirmedAt: Date
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const Tender = mongoose.model('Tender', tenderSchema);
const Project = mongoose.model('Project', projectSchema);
const Bid = mongoose.model('Bid', bidSchema);
const BlockchainTransaction = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);

async function initDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create indexes
    await User.collection.createIndexes([
      { key: { email: 1 }, unique: true }
    ]);

    await Tender.collection.createIndexes([
      { key: { status: 1, deadline: 1 } },
      { key: { government: 1 } },
      { key: { contractor: 1 } },
      { key: { title: 'text', description: 'text' } }
    ]);

    await Project.collection.createIndexes([
      { key: { contractor: 1 } },
      { key: { government: 1 } },
      { key: { status: 1 } }
    ]);

    await Bid.collection.createIndexes([
      { key: { tender: 1 } },
      { key: { contractor: 1 } }
    ]);

    await BlockchainTransaction.collection.createIndexes([
      { key: { transactionHash: 1 }, unique: true },
      { key: { project: 1 } },
      { key: { tender: 1 } }
    ]);

    console.log('Database indexes created successfully');

    // Create sample data if database is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Creating sample data...');
      
      // Create sample government user
      const govUser = new User({
        email: 'government@example.com',
        password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // password: government123
        role: 'government',
        name: 'Government Official',
        wallet_address: process.env.OWNER_ADDRESS || 'RI4L5XJSRDUPNW7ZFEXFTJ2WWFI2MC2WNFXLL6HSZ2PLHRVSOWSGKO2DSM'
      });
      await govUser.save();
      
      // Create sample contractor user
      const contractorUser = new User({
        email: 'contractor@example.com',
        password: '$2a$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', // password: contractor123
        role: 'contractor',
        name: 'Contractor Company',
        wallet_address: process.env.CONTRACTOR_ADDRESS || 'ITSTYRW6UURLHKDIKT5HD7AUOPD73TGE72YZBMAMCVDEMKDXQZS6YFCTQQ'
      });
      await contractorUser.save();
      
      console.log('Sample users created');
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
if (require.main === module) {
  initDatabase();
}

module.exports = { User, Tender, Project, Bid, BlockchainTransaction };