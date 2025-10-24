// Project Model for FairLens
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true
  },
  government: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  contractAddress: {
    type: String,
    default: null
  },
  blockchainDeployed: {
    type: Boolean,
    default: false
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'paid'],
      default: 'pending'
    },
    submissionDate: {
      type: Date,
      default: null
    },
    approvalDate: {
      type: Date,
      default: null
    },
    paymentDate: {
      type: Date,
      default: null
    },
    blockchainHash: {
      type: String,
      default: null
    },
    documents: [{
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
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
projectSchema.index({ status: 1, startDate: 1 });
projectSchema.index({ government: 1 });
projectSchema.index({ contractor: 1 });
projectSchema.index({ tender: 1 });

module.exports = mongoose.model('Project', projectSchema);
