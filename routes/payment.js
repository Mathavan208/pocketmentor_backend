// routes/payment.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  getPaymentHistory
} = require('../controllers/paymentController');

// Protected routes
router.post('/create-order/:courseId', protect, createOrder);
router.post('/verify/:courseId', protect, verifyPayment);
router.get('/history', protect, admin, getPaymentHistory);

module.exports = router;