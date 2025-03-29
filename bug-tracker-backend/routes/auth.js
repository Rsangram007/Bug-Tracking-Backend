const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('dotenv');

config(); // Load environment variables

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optional: User registration (could be restricted to admins via admin.js)
// Uncomment if you want public registration

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if the database is empty
    const userCount = await User.countDocuments();
    
    // If no users exist, set first user as admin
    const assignedRole = userCount === 0 ? 'admin' : role || 'user';

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const user = new User({ username, email, password, role: assignedRole });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      token, 
      user: { id: user._id, username, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;