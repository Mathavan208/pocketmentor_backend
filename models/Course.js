// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  syllabus: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'upcoming'],
    default: 'available',
  },
  launchDate: {
    type: String,
  },
  paymentLink: {
    type: String,
  },
  curriculum: [{
    week: Number,
    topics: [String],
  }],
  price: {
    type: Number,
    required: true,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Course', courseSchema);