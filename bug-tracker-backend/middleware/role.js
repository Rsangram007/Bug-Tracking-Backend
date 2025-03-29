// Middleware to check user role
const role = (allowedRoles) => {
    return (req, res, next) => {
      // Ensure auth middleware has run first and provided req.user
      if (!req.user || !req.user.role) {
        return res.status(403).json({ error: 'Access denied. User role not found.' });
      }
  
      // Check if the user's role is in the allowedRoles array
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      }
  
      // If role is allowed, proceed to the next middleware or route handler
      next();
    };
  };
  
  module.exports = role;