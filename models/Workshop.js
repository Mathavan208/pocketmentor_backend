const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
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
  level: {
    type: String,
    required: true,
  },
  prerequisites: {
    type: String,
    required: true,
  },
  topics: [String],
  schedule: [{
    title: String,
    duration: String,
    description: String,
  }],
  status: {
    type: String,
    enum: ['available', 'upcoming'],
    default: 'available',
  },
  registrationLink: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
   price: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model('Workshop', workshopSchema);