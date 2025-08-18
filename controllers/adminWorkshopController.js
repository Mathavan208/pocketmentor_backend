const Workshop = require('../models/Workshop');

// @desc    Get all workshops
// @route   GET /api/admin/workshops
// @access  Private/Admin
exports.getWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find({});
    res.json({
      success: true,
      data: workshops
    });
  } catch (error) {
    console.error('Get workshops error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get workshop by ID
// @route   GET /api/admin/workshops/:id
// @access  Private/Admin
exports.getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (workshop) {
      res.json({
        success: true,
        data: workshop
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Workshop not found' 
      });
    }
  } catch (error) {
    console.error('Get workshop by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create a workshop
// @route   POST /api/admin/workshops
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
      price: req.body.price || 0
    });
    
    const createdWorkshop = await workshop.save();
    res.status(201).json({
      success: true,
      data: createdWorkshop
    });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Update a workshop
// @route   PUT /api/admin/workshops/:id
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
      workshop.price = req.body.price || workshop.price;
      
      const updatedWorkshop = await workshop.save();
      res.json({
        success: true,
        data: updatedWorkshop
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Workshop not found' 
      });
    }
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete a workshop
// @route   DELETE /api/admin/workshops/:id
// @access  Private/Admin
exports.deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (workshop) {
      await workshop.remove();
      res.json({ 
        success: true, 
        message: 'Workshop removed' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Workshop not found' 
      });
    }
  } catch (error) {
    console.error('Delete workshop error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};