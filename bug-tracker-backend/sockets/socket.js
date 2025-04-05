const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Initialize Socket.io with the HTTP server
module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? 'https://bug-tracking-backend.onrender.com' 
        : 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    cookie: true
  });

  // Handle socket connections
// Update your JWT verification middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error: Token is required'));
  }

  try {
    // Verify with same secret and options as HTTP routes
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.error('Socket token verification failed:', err.message);
    
    // Differentiate between expired and invalid tokens
    if (err.name === 'TokenExpiredError') {
      // Allow expired tokens to attempt refresh
      socket.emit('token-expired');
      return next(new Error('Token expired'));
    }
    return next(new Error('Invalid token'));
  }
});

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // User joins their own room based on their user ID
    socket.on('join', (userId) => {
      socket.join(userId); // Each user gets a unique room
      console.log(`User ${userId} joined room: ${userId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Return io instance for use in services (e.g., notifyService.js)
  return io;
};