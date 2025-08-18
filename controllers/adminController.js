// controllers/adminController.js
const User = require('../models/User');
const Course = require('../models/Course');
const Workshop = require('../models/Workshop');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const CourseMaterial = require('../models/CourseMaterial');
const CourseDayProgress = require('../models/CourseDayProgress');

// ... existing functions ...
// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalWorkshops = await Workshop.countDocuments();
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const stats = {
      totalUsers,
      totalCourses,
      totalWorkshops,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      user.role = req.body.role;
      await user.save();
      
      res.json({ 
        success: true, 
        message: 'User role updated' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('user', 'name email')
      .populate('course', 'title')
      .populate('workshop', 'title');
    
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
// @access  Private/Admin
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('user', 'name email')
      .populate('course', 'title')
      .populate('workshop', 'title')
      .sort({ enrollmentDate: -1 });
    
    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update payment status of an enrollment
// @route   PUT /api/admin/enrollments/:id/payment-status
// @access  Private/Admin
// controllers/adminController.js

// @desc    Update payment status of an enrollment
// @route   PUT /api/admin/enrollments/:id/payment-status
// @access  Private/Admin
// controllers/adminController.js

// @desc    Update payment status of an enrollment
// @route   PUT /api/admin/enrollments/:id/payment-status
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (enrollment) {
      const oldStatus = enrollment.paymentStatus;
      const newStatus = req.body.paymentStatus;
      
      // Update payment status
      enrollment.paymentStatus = newStatus;
      enrollment.paymentDate = new Date();
      
      // If changing to paid, update user's access
      if (newStatus === 'paid' && oldStatus !== 'paid') {
        const user = await User.findById(enrollment.user);
        if (user && !user.enrolledCourses.includes(enrollment.course)) {
          user.enrolledCourses.push(enrollment.course);
          await user.save();
        }
        
        // Create payment record for admin tracking
        const payment = new Payment({
          user: enrollment.user,
          course: enrollment.course,
          amount: enrollment.amount || 0,
          status: 'completed',
          paymentMethod: 'manual',
          notes: 'Manual payment update by admin'
        });
        await payment.save();
        
        // Update course revenue
        const course = await Course.findById(enrollment.course);
        if (course) {
          course.revenue += (enrollment.amount || 0);
          course.enrollmentCount += 1;
          await course.save();
        }
      }
      
      await enrollment.save();
      
      res.json({
        success: true,
        message: 'Payment status updated successfully',
        enrollment: {
          id: enrollment._id,
          status: enrollment.paymentStatus,
          amount: enrollment.amount
        }
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Enrollment not found' 
      });
    }
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Update progress of an enrollment
// @route   PUT /api/admin/enrollments/:id/progress
// @access  Private/Admin
exports.updateProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (enrollment) {
      const { dayNumber, completed } = req.body;
      
      // Update specific day
      const dayIndex = enrollment.completedDays.findIndex(d => d.day === dayNumber);
      if (dayIndex !== -1) {
        enrollment.completedDays[dayIndex].completed = completed;
        enrollment.completedDays[dayIndex].completedAt = completed ? new Date() : null;
      }
      
      // Calculate overall progress
      const completedCount = enrollment.completedDays.filter(d => d.completed).length;
      const totalDays = enrollment.completedDays.length;
      enrollment.progress = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
      
      await enrollment.save();
      
      res.json({
        success: true,
        message: 'Progress updated',
        progress: enrollment.progress
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Enrollment not found' 
      });
    }
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ... rest of the adminController functions remain the same ...

// @desc    Create initial admin user
// @route   POST /api/admin/create-admin
// @access  Public (only for initial setup)
exports.createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminExists = await User.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admin already exists' 
      });
    }

    const admin = await User.create({
      name: 'Admin',
      email,
      password,
      role: 'admin',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get course statistics
// @route   GET /api/admin/courses/stats
// @access  Private/Admin
exports.getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const availableCourses = await Course.countDocuments({ status: 'available' });
    const upcomingCourses = await Course.countDocuments({ status: 'upcoming' });
    
    // Get enrollment counts per course
    const enrollmentStats = await Enrollment.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } }
    ]);
    
    const stats = {
      totalCourses,
      availableCourses,
      upcomingCourses,
      enrollmentStats,
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get workshop statistics
// @route   GET /api/admin/workshops/stats
// @access  Private/Admin
exports.getWorkshopStats = async (req, res) => {
  try {
    const totalWorkshops = await Workshop.countDocuments();
    const availableWorkshops = await Workshop.countDocuments({ status: 'available' });
    const upcomingWorkshops = await Workshop.countDocuments({ status: 'upcoming' });
    
    // Get enrollment counts per workshop
    const enrollmentStats = await Enrollment.aggregate([
      { $group: { _id: '$workshop', count: { $sum: 1 } } }
    ]);
    
    const stats = {
      totalWorkshops,
      availableWorkshops,
      upcomingWorkshops,
      enrollmentStats,
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get workshop stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get user activity stats
// @route   GET /api/admin/users/activity
// @access  Private/Admin
exports.getUserActivityStats = async (req, res) => {
  try {
    // Get users created in the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const newUsers = await User.countDocuments({ createdAt: { $gte: lastWeek } });
    
    // Get active users (users who have enrolled in courses/workshops in the last 30 days)
    const activeUsers = await Enrollment.aggregate([
      { $match: { enrollmentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    
    // Get total enrollments in the last 30 days
    const recentEnrollments = await Enrollment.countDocuments({ 
      enrollmentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    
    const stats = {
      newUsers,
      activeUsers: activeUsers.length,
      recentEnrollments,
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get user activity stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get revenue statistics
// @route   GET /api/admin/revenue
// @access  Private/Admin
exports.getRevenueStats = async (req, res) => {
  try {
    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Revenue by course
    const revenueByCourse = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$course', revenue: { $sum: '$amount' } } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { courseName: '$course.title', revenue: 1 } }
    ]);
    
    // Monthly revenue for the last 6 months
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        revenueByCourse,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete enrollment
// @route   DELETE /api/admin/enrollments/:id
// @access  Private/Admin
// ... existing imports and functions ...

// @desc    Delete enrollment
// @route   DELETE /api/admin/enrollments/:id
// @access  Private/Admin
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    // console.log(enrollment)
    if (enrollment) {
      // Remove from user's enrolled courses
      const user = await User.findById(enrollment.user);
      if (user) {
        user.enrolledCourses = user.enrolledCourses.filter(
          courseId => courseId.toString() !== enrollment.course.toString()
        );
        await user.save();
      }
      
      // Remove any related course day progress records
      await CourseDayProgress.deleteMany({ enrollment: req.params.id });
      
      // Remove the enrollment
      await Enrollment.deleteOne({_id:req.params.id});

      res.json({ 
        success: true, 
        message: 'Enrollment deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Enrollment not found' 
      });
    }
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ... rest of the controller ...
// ... existing imports ...


// @desc    Create course materials for a day
// @route   POST /api/admin/courses/:courseId/materials
// @access  Private/Admin
// ... existing imports ...

// ... existing functions ...

// @desc    Create course materials for a day
// @route   POST /api/admin/courses/:courseId/materials
// @access  Private/Admin
exports.createCourseMaterials = async (req, res) => {
  try {
    const { courseId, day, title, description, materials } = req.body;
    
    const courseMaterial = new CourseMaterial({
      course: courseId,
      day,
      title,
      description,
      materials
    });
    
    await courseMaterial.save();
    
    res.status(201).json({
      success: true,
      data: courseMaterial
    });
  } catch (error) {
    console.error('Create course materials error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Get course materials for a specific day
// @route   GET /api/courses/:courseId/materials/:day
// @access  Private
exports.getCourseDayMaterials = async (req, res) => {
  try {
    const { courseId, day } = req.params;
    
    const materials = await CourseMaterial.find({
      course: courseId,
      day: day
    });
    
    res.json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error('Get course day materials error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// @desc    Update course day progress
// @route   PUT /api/admin/enrollments/:enrollmentId/progress/:day
// @access  Private/Admin
// ... existing imports ...

// @desc    Update progress of an enrollment
// @route   PUT /api/admin/enrollments/:id/progress
// @access  Private/Admin
exports.updateProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (enrollment) {
      const { dayNumber, completed } = req.body;
      
      // Update specific day - ensure completed is a boolean
      const dayIndex = enrollment.completedDays.findIndex(d => d.day === dayNumber);
      if (dayIndex !== -1) {
        enrollment.completedDays[dayIndex].completed = Boolean(completed);
        enrollment.completedDays[dayIndex].completedAt = completed ? new Date() : null;
      }
      
      // Calculate overall progress
      const completedCount = enrollment.completedDays.filter(d => d.completed).length;
      const totalDays = enrollment.completedDays.length;
      enrollment.progress = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
      
      await enrollment.save();
      
      res.json({
        success: true,
        message: 'Progress updated',
        progress: enrollment.progress
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Enrollment not found' 
      });
    }
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};

// ... rest of the controller ...