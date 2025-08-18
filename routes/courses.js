const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getCourseDayMaterials
} = require('../controllers/courseController');

router.route('/').get(getCourses);
router.route('/:id').get(getCourseById);
router.route('/').post(protect, createCourse);
router.route('/:id').put(protect, updateCourse);
router.route('/:id').delete(protect, deleteCourse);
router.route('/:id/enroll').post(protect, enrollCourse);
router.get('/:courseId/materials/:day', getCourseDayMaterials);

module.exports = router;