const { Server } = require('socket.io');

// Initialize Socket.io with the HTTP server
module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    cookie: true
  });

  // Handle socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Verify token here (use your JWT verification logic)
    next();
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