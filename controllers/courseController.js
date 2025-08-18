const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const CourseMaterial = require('../models/CourseMaterial');

const User=require('../models/User');
// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  try {
    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      syllabus: req.body.syllabus,
      status: req.body.status,
      launchDate: req.body.launchDate,
      paymentLink: req.body.paymentLink,
      curriculum: req.body.curriculum,
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      course.title = req.body.title || course.title;
      course.description = req.body.description || course.description;
      course.image = req.body.image || course.image;
      course.syllabus = req.body.syllabus || course.syllabus;
      course.status = req.body.status || course.status;
      course.launchDate = req.body.launchDate || course.launchDate;
      course.paymentLink = req.body.paymentLink || course.paymentLink;
      course.curriculum = req.body.curriculum || course.curriculum;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      await course.remove();
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
// controllers/courseController.js
// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
// controllers/courseController.js


// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
// ... existing imports ...

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (course) {
      // Check if user is already enrolled
      const user = await User.findById(req.user._id);
      const existingEnrollment = await Enrollment.findOne({
        user: req.user._id,
        course: req.params.id
      });
      
      if (existingEnrollment) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already enrolled in this course' 
        });
      }
      
      // Calculate total days from curriculum
      let totalDays = 0;
      if (course.curriculum) {
        totalDays = course.curriculum.reduce((sum, week) => sum + week.topics.length, 0);
      }
      
      // Create enrollment record with pending status
      const enrollment = new Enrollment({
        user: req.user._id,
        course: course._id,
        paymentStatus: 'pending',
        amount: course.price || 0,
        paymentMethod: 'manual',
        completedDays: Array.from({ length: totalDays }, (_, i) => ({
          day: i + 1,
          completed: false,
          completedAt: null
        }))
      });
      
      await enrollment.save();
      
      // Add course to user's enrolled courses
      user.enrolledCourses.push(course._id);
      await user.save();
      
      res.json({ 
        success: true,
        message: 'Enrolled successfully. Please complete payment.',
        enrollmentId: enrollment._id,
        paymentLink: course.paymentLink
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
};
// ... existing imports ...

// ... existing functions ...

// @desc    Get course materials for a specific day
// @route   GET /api/courses/:courseId/materials/:day
// @access  Private
// ... existing imports ...

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