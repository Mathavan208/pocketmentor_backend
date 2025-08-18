const Workshop = require('../models/Workshop');
const Enrollment = require('../models/Enrollment');

// @desc    Get all workshops
// @route   GET /api/workshops
// @access  Public
exports.getWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find({});
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get workshop by ID
// @route   GET /api/workshops/:id
// @access  Public
exports.getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (workshop) {
      res.json(workshop);
    } else {
      res.status(404).json({ message: 'Workshop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a workshop
// @route   POST /api/workshops
// @access  Private/Admin
exports.createWorkshop = async (req, res) => {
  try {
    const workshop = new Workshop({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      level: req.body.level,
      prerequisites: req.body.prerequisites,
      topics: req.body.topics,
      schedule: req.body.schedule,
      status: req.body.status,
      registrationLink: req.body.registrationLink,
    });

    const createdWorkshop = await workshop.save();
    res.status(201).json(createdWorkshop);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a workshop
// @route   PUT /api/workshops/:id
// @access  Private/Admin
exports.updateWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (workshop) {
      workshop.title = req.body.title || workshop.title;
      workshop.description = req.body.description || workshop.description;
      workshop.image = req.body.image || workshop.image;
      workshop.level = req.body.level || workshop.level;
      workshop.prerequisites = req.body.prerequisites || workshop.prerequisites;
      workshop.topics = req.body.topics || workshop.topics;
      workshop.schedule = req.body.schedule || workshop.schedule;
      workshop.status = req.body.status || workshop.status;
      workshop.registrationLink = req.body.registrationLink || workshop.registrationLink;

      const updatedWorkshop = await workshop.save();
      res.json(updatedWorkshop);
    } else {
      res.status(404).json({ message: 'Workshop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a workshop
// @route   DELETE /api/workshops/:id
// @access  Private/Admin
exports.deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (workshop) {
      await workshop.remove();
      res.json({ message: 'Workshop removed' });
    } else {
      res.status(404).json({ message: 'Workshop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Enroll in a workshop
// @route   POST /api/workshops/:id/enroll
// @access  Private
exports.enrollWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (workshop) {
      // Check if user is already enrolled
      const user = await User.findById(req.user._id);
      const isEnrolled = user.enrolledWorkshops.includes(workshop._id);

      if (isEnrolled) {
        return res.status(400).json({ message: 'Already enrolled in this workshop' });
      }

      // Add workshop to user's enrolled workshops
      user.enrolledWorkshops.push(workshop._id);
      await user.save();

      // Create enrollment record
      const enrollment = new Enrollment({
        user: req.user._id,
        workshop: workshop._id,
      });
      await enrollment.save();

      res.json({ message: 'Enrolled successfully' });
    } else {
      res.status(404).json({ message: 'Workshop not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};