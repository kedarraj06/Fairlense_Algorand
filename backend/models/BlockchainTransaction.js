// Blockchain Transaction Model for FairLens
const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project.milestones',
    default: null
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  transactionType: {
    type: String,
    enum: ['payment', 'milestone', 'verification', 'contract_deployment'],
    required: true
  },
  amount: {
    type: Number,
    min: 0,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  blockNumber: {
    type: Number,
    default: null
  },
  gasUsed: {
    type: Number,
    default: null
  },
  gasPrice: {
    type: Number,
    default: null
  },
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  contractAddress: {
    type: String,
    default: null
  },
  appId: {
    type: Number,
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  failureReason: {
    type: String,
    default: null
  },
  rawTransaction: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
blockchainTransactionSchema.index({ transactionHash: 1 });
blockchainTransactionSchema.index({ project: 1 });
blockchainTransactionSchema.index({ status: 1 });
blockchainTransactionSchema.index({ transactionType: 1 });
blockchainTransactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);
