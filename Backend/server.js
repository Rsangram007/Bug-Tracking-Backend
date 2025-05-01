const express = require('express');
const http = require('http');
const cors = require('cors');
const { config } = require('dotenv');
const cluster = require('cluster');
const os = require('os');
const connectDB = require('./config/db');
const socket = require('./sockets/socket');
const notifyService = require('./services/notifyService');
config();

// Enable cluster mode for multi-core processing
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Replace the dead worker
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = socket(server); // Initialize Socket.io
  notifyService.setIo(io);  // Pass io to notifyService

  // Optimize Express for concurrent requests
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bugs', require('./routes/bugs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

connectDB();

const PORT = process.env.PORT ;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))


};
