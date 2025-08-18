// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// Add enrollment routes for users
router.get('/enrollments', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course', 'title description image curriculum paymentLink');
    
    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get user enrollments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});
// routes/auth.js
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);
    
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      await user.save();
      
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// routes/auth.js
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Current password is incorrect' });
    }
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;