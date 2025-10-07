const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  keyResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KeyResult',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  currentValue: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  confidence: {
    type: String,
    enum: ['on-track', 'at-risk', 'off-track'],
    required: true,
  },
  statusComment: String,
  blockers: String,
  completedTaskIds: [String],
  isLate: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
checkInSchema.index({ keyResultId: 1, submittedAt: -1 });
checkInSchema.index({ userId: 1, submittedAt: -1 });

module.exports = mongoose.model('CheckIn', checkInSchema);
