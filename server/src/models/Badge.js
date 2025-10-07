const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  badgeType: {
    type: String,
    required: true,
    enum: [
      'first-okr',        // Create your first OKR
      'streak-7',         // 7-day check-in streak
      'streak-30',        // 30-day check-in streak
      'achiever-100',     // Complete an OKR with 100% progress
      'team-player',      // Aligned to 5+ team objectives
      'early-bird',       // First check-in of the quarter
      'perfectionist',    // 3 OKRs completed at 100%
      'leader',           // Manage 10+ team OKRs
      'consistent',       // Check-in every week for a quarter
      'overachiever',     // 5 OKRs completed at 100%
    ],
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '🏆',
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for faster queries
badgeSchema.index({ userId: 1, badgeType: 1 }, { unique: true }); // Prevent duplicate badges
badgeSchema.index({ userId: 1 });
badgeSchema.index({ earnedAt: -1 });

module.exports = mongoose.model('Badge', badgeSchema);
