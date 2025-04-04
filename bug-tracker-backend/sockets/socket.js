const { Server } = require('socket.io');

// Initialize Socket.io with the HTTP server
module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust this in production to specific frontend URL
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Handle socket connections
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