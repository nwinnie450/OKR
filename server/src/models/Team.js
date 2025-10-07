const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
  },
  leaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  memberCount: {
    type: Number,
    default: 0,
  },
  // Additional metadata
  tags: [String],
  color: {
    type: String,
    default: '#3b82f6', // Default blue color
  },
}, {
  timestamps: true,
});

// Index for faster queries
teamSchema.index({ name: 1 });
teamSchema.index({ leaderId: 1 });
teamSchema.index({ department: 1 });
teamSchema.index({ isActive: 1 });

// Virtual for getting team members
teamSchema.virtual('members', {
  ref: 'User',
  localField: '_id',
  foreignField: 'teamId',
});

module.exports = mongoose.model('Team', teamSchema);
