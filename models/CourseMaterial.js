const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  materials: [{
    type: {
      type: String,
      enum: ['link', 'pdf'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);