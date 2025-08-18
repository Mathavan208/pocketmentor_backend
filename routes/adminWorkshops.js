const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
} = require('../controllers/workshopController');

// All routes require authentication and admin privileges
router.use(protect, admin);

// CRUD operations for workshops
router.route('/').get(getWorkshops).post(createWorkshop);
router.route('/:id').get(getWorkshopById).put(updateWorkshop).delete(deleteWorkshop);

module.exports = router;