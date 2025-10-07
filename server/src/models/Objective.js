const mongoose = require('mongoose');

const objectiveSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['company', 'department', 'team', 'individual'],
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  timePeriod: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'Annual'],
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active',
  },
  category: String,
  tags: [String],
  alignedToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objective',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  confidence: {
    type: String,
    enum: ['on-track', 'at-risk', 'off-track'],
    default: 'on-track',
  },
  publishedAt: Date,
  // Additional fields from OKR creation
  context: String,
  relatedTo: String,
  initiatives: [String],
}, {
  timestamps: true,
});

// Index for faster queries
objectiveSchema.index({ ownerId: 1, status: 1 });
objectiveSchema.index({ departmentId: 1, status: 1 });
objectiveSchema.index({ teamId: 1, status: 1 });
objectiveSchema.index({ timePeriod: 1, year: 1 });

module.exports = mongoose.model('Objective', objectiveSchema);
