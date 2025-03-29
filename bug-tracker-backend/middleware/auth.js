const jwt = require('jsonwebtoken');
const { config } = require('dotenv');

config(); // Load environment variables

// Middleware to verify JWT token
const auth = (req, res, next) => {
  // Get token from Authorization header (Bearer <token>)
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if token exists
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Verify token using the secret from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info (e.g., user ID and role) to request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;