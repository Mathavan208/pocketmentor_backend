const mongoose = require('mongoose');
const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  workshop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  // Keep the old completedDays for backward compatibility
  completedDays: [{
    day: Number,
    completed: Boolean,
    completedAt: Date
  }],
  // Add new progress tracking
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  amount: {
    type: Number,
    default: 0
  }
});

// Index for better performance
enrollmentSchema.index({ course: 1, paymentStatus: 1 });
module.exports = mongoose.model('Enrollment', enrollmentSchema);