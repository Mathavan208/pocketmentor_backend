// controllers/paymentController.js
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const crypto = require('crypto');

// @desc    Create payment order
// @route   POST /api/payment/create-order/:courseId
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    console.log('Creating order for course ID:', req.params.courseId);
    console.log('User ID:', req.user.id);
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      console.error('Course not found:', req.params.courseId);
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    console.log('Course found:', course.title, 'Price:', course.price);

    // Check if user is already enrolled
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const isEnrolled = user.enrolledCourses.includes(course._id);
    if (isEnrolled) {
      console.log('User already enrolled in course:', course._id);
      return res.status(400).json({ 
        success: false, 
        message: 'Already enrolled in this course' 
      });
    }

    // Generate a unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Generated order ID:', orderId);
    
    // Create enrollment record with pending status
    const enrollment = new Enrollment({
      user: req.user.id,
      course: course._id,
      amount: course.price,
      razorpayOrderId: orderId
    });
    
    await enrollment.save();
    console.log('Enrollment saved successfully');

    // Return order details to frontend
    const response = {
      success: true,
      orderId: orderId,
      amount: course.price * 100, // Convert to paise
      currency: 'INR',
      courseName: course.title,
      courseId: course._id
    };
    
    console.log('Order creation response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Verify payment and update enrollment
// @route   POST /api/payment/verify/:courseId
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;
    console.log('Verifying payment:', { paymentId, orderId, signature });
    
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Find the enrollment record
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id,
      razorpayOrderId: orderId
    });

    if (!enrollment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Enrollment not found' 
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest('hex');

    console.log('Signature verification:', {
      generated: generatedSignature,
      received: signature,
      match: generatedSignature === signature
    });

    if (generatedSignature !== signature) {
      enrollment.paymentStatus = 'failed';
      await enrollment.save();
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid signature' 
      });
    }

    // Update enrollment with payment details
    enrollment.paymentStatus = 'paid';
    enrollment.razorpayPaymentId = paymentId;
    enrollment.razorpaySignature = signature;
    enrollment.paidAt = new Date();
    await enrollment.save();

    // Update user's enrolled courses
    const user = await User.findById(req.user.id);
    user.enrolledCourses.push(course._id);
    await user.save();

    // Update course revenue and enrollment count
    course.revenue += course.price;
    course.enrollmentCount += 1;
    await course.save();

    console.log('Payment verified successfully for course:', course.title);
    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      enrollmentId: enrollment._id
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Get payment history for admin
// @route   GET /api/payment/history
// @access  Private/Admin
exports.getPaymentHistory = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('user', 'name email')
      .populate('course', 'title price')
      .sort({ paidAt: -1 });
    
    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};