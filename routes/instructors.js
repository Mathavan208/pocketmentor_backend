const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
} = require('../controllers/instructorController');

// Public routes
router.route('/').get(getInstructors);
router.route('/:id').get(getInstructorById);

// Protected routes
router.route('/').post(protect, admin, createInstructor);
router.route('/:id').put(protect, admin, updateInstructor);
router.route('/:id').delete(protect, admin, deleteInstructor);

module.exports = router;