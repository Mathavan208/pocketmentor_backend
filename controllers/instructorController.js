const Instructor = require('../models/Instructor');

// @desc    Get all instructors
// @route   GET /api/instructors
// @access  Public
exports.getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find({});
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get instructor by ID
// @route   GET /api/instructors/:id
// @access  Public
exports.getInstructorById = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);

    if (instructor) {
      res.json(instructor);
    } else {
      res.status(404).json({ message: 'Instructor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create an instructor
// @route   POST /api/instructors
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
    res.status(201).json(createdInstructor);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an instructor
// @route   PUT /api/instructors/:id
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
      res.json(updatedInstructor);
    } else {
      res.status(404).json({ message: 'Instructor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an instructor
// @route   DELETE /api/instructors/:id
// @access  Private/Admin
exports.deleteInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findById(req.params.id);

    if (instructor) {
      await instructor.remove();
      res.json({ message: 'Instructor removed' });
    } else {
      res.status(404).json({ message: 'Instructor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};