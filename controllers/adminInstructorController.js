const Instructor = require('../models/Instructor');

// @desc    Get all instructors
// @route   GET /api/admin/instructors
// @access  Private/Admin
exports.getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find({});
    res.json({
      success: true,
      data: instructors
    });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get instructor by ID
// @route   GET /api/admin/instructors/:id
// @access  Private/Admin
exports.getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (instructor) {
      res.json({
        success: true,
        data: instructor
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Instructor not found' 
      });
    }
  } catch (error) {
    console.error('Get instructor by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create an instructor
// @route   POST /api/admin/instructors
// @access  Private/Admin
exports.createInstructor = async (req, res) => {
  try {
    const instructor = new Instructor({
      name: req.body.name,
      profession: req.body.profession,
      image: req.body.image,
      bio: req.body.bio,
      social: req.body.social,
    });
    
    const createdInstructor = await instructor.save();
    res.status(201).json({
      success: true,
      data: createdInstructor
    });
  } catch (error) {
    console.error('Create instructor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update an instructor
// @route   PUT /api/admin/instructors/:id
// @access  Private/Admin
exports.updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (instructor) {
      instructor.name = req.body.name || instructor.name;
      instructor.profession = req.body.profession || instructor.profession;
      instructor.image = req.body.image || instructor.image;
      instructor.bio = req.body.bio || instructor.bio;
      instructor.social = req.body.social || instructor.social;
      
      const updatedInstructor = await instructor.save();
      res.json({
        success: true,
        data: updatedInstructor
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Instructor not found' 
      });
    }
  } catch (error) {
    console.error('Update instructor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete an instructor
// @route   DELETE /api/admin/instructors/:id
// @access  Private/Admin
exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (instructor) {
      await instructor.remove();
      res.json({ 
        success: true, 
        message: 'Instructor removed' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Instructor not found' 
      });
    }
  } catch (error) {
    console.error('Delete instructor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};