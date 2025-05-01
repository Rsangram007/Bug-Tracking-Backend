const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT verification
const role = require('../middleware/role'); // Role-based access
const bugService = require('../services/bugService');
const User = require('../models/User');

// Get all users (Admin only)
router.get('/users', auth, role(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign a bug to a developer (Admin only)
router.put('/bugs/:id/assign', auth, role(['admin','qa']), async (req, res) => {
  const { developerId } = req.body;
  try {
    const bug = await bugService.assignBug(req.params.id, developerId);
    res.json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bugs (Admin view - unrestricted)
router.get('/bugs', auth, role(['admin']), async (req, res) => {
  try {
    const bugs = await bugService.getAllBugs(req.user);
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new user (Admin only)
router.post('/users', auth, role(['admin']), async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const user = new User({ username, email, password, role });
    await user.save(); // Password hashing should be handled in a pre-save hook (see below)
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;