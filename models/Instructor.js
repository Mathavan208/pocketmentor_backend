const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  social: {
    linkedin: String,
    github: String,
    twitter: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Instructor', instructorSchema);