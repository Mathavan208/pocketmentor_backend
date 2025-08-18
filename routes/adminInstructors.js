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

// All routes require authentication and admin privileges
router.use(protect, admin);

// CRUD operations for instructors
router.route('/').get(getInstructors).post(createInstructor);
router.route('/:id').get(getInstructorById).put(updateInstructor).delete(deleteInstructor);

module.exports = router;