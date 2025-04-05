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



router.get('/login', (req, res) => {
  res.status(200).json({ 
    status: 'auth-service-ok',
    message: 'Authentication service operational'
  });
});


// Token refresh endpoint
router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate a new token
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// Verify token endpoint
router.get('/verify-token', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

module.exports = router;