// Tender Model for FairLens
const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  requirements: [{
    type: String
  }],
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'paid'],
      default: 'pending'
    }
  }],
  government: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'awarded', 'cancelled'],
    default: 'open'
  },
  contractAddress: {
    type: String,
    default: null
  },
  blockchainDeployed: {
    type: Boolean,
    default: false
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String
  }],
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

// Index for better query performance
tenderSchema.index({ status: 1, deadline: 1 });
tenderSchema.index({ government: 1 });
tenderSchema.index({ contractor: 1 });
tenderSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Tender', tenderSchema);
