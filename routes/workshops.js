const express = require('express');
const router = express.Router();
const {
  getWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  enrollWorkshop,
} = require('../controllers/workshopController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getWorkshops);
router.route('/:id').get(getWorkshopById);
router.route('/').post(protect, admin, createWorkshop);
router.route('/:id').put(protect, admin, updateWorkshop);
router.route('/:id').delete(protect, admin, deleteWorkshop);
router.route('/:id/enroll').post(protect, enrollWorkshop);

module.exports = router;