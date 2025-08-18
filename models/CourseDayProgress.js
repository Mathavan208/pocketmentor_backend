// models/CourseDayProgress.js
const mongoose = require('mongoose');
const courseDayProgressSchema = new mongoose.Schema({
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  meetAttended: {
    type: Boolean,
    default: false
  },
  assessmentCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});
module.exports = mongoose.model('CourseDayProgress', courseDayProgressSchema);