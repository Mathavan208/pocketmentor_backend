// routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  getPayments,
  getEnrollments,
  updatePaymentStatus,
  updateProgress,
  createAdmin,
  getCourseStats,
  getWorkshopStats,
  getUserActivityStats,
  getRevenueStats,
  deleteEnrollment,
  createCourseMaterials,
  updateCourseDayProgress,
   getCourseDayMaterials
} = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.use(protect, admin);

// Dashboard routes
router.get('/dashboard', getDashboardStats);
router.get('/courses/stats', getCourseStats);
router.get('/workshops/stats', getWorkshopStats);
router.get('/users/activity', getUserActivityStats);
router.get('/revenue', getRevenueStats);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);

// Payment and enrollment routes
router.get('/payments', getPayments);
router.get('/enrollments', getEnrollments);
router.put('/enrollments/:id/payment-status', updatePaymentStatus);
router.put('/enrollments/:id/progress', updateProgress);
router.delete('/enrollments/:id', deleteEnrollment);
router.post('/courses/:courseId/materials', createCourseMaterials);

// Course day progress routes
router.get('/courses/:courseId/materials/:day', getCourseDayMaterials);

// Admin setup (public for initial setup)
router.post('/create-admin', createAdmin);

module.exports = router;