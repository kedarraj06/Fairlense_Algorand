// Bid Model for FairLens
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tender',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  proposal: {
    type: String,
    required: true
  },
  timeline: {
    type: Number,
    required: true,
    min: 1 // in days
  },
  status: {
    type: String,
    enum: ['submitted', 'accepted', 'rejected', 'withdrawn'],
    default: 'submitted'
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  technicalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  financialScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  evaluationNotes: {
    type: String,
    default: null
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  evaluatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Ensure one bid per contractor per tender
bidSchema.index({ tender: 1, contractor: 1 }, { unique: true });

// Index for better query performance
bidSchema.index({ tender: 1, status: 1 });
bidSchema.index({ contractor: 1 });
bidSchema.index({ status: 1 });

module.exports = mongoose.model('Bid', bidSchema);
