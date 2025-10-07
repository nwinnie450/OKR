const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    unique: true,
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    trim: true,
    unique: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  headOfDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Index for faster queries
departmentSchema.index({ isActive: 1, code: 1 });

// Method to get active departments
departmentSchema.statics.getActive = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

module.exports = mongoose.model('Department', departmentSchema);
