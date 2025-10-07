const mongoose = require('mongoose');

const keyResultSchema = new mongoose.Schema({
  objectiveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objective',
    required: true,
  },
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
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  metricType: {
    type: String,
    enum: ['number', 'percentage', 'currency', 'boolean'],
    required: true,
  },
  unit: String,
  startingValue: {
    type: Number,
    required: true,
  },
  targetValue: {
    type: Number,
    required: true,
  },
  currentValue: {
    type: Number,
    default: function() {
      return this.startingValue;
    },
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
  dueDate: Date,
  lastCheckinAt: Date,
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Auto-calculate progress when currentValue changes
keyResultSchema.pre('save', function(next) {
  if (this.isModified('currentValue') || this.isModified('targetValue') || this.isModified('startingValue')) {
    const { startingValue, currentValue, targetValue } = this;

    if (targetValue === startingValue) {
      this.progress = 100;
    } else {
      const progressCalc = ((currentValue - startingValue) / (targetValue - startingValue)) * 100;
      this.progress = Math.max(0, Math.min(100, Math.round(progressCalc)));
    }

    // Auto-determine confidence based on progress
    if (this.progress >= 70) {
      this.confidence = 'on-track';
    } else if (this.progress >= 40) {
      this.confidence = 'at-risk';
    } else {
      this.confidence = 'off-track';
    }
  }
  next();
});

// Index for faster queries
keyResultSchema.index({ objectiveId: 1 });
keyResultSchema.index({ ownerId: 1 });

module.exports = mongoose.model('KeyResult', keyResultSchema);
