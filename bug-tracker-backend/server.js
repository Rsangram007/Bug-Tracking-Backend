const express = require('express');
const http = require('http');
const cors = require('cors');
const { config } = require('dotenv');
const connectDB = require('./config/db');
const socket = require('./sockets/socket');
const notifyService = require('./services/notifyService');
config();

const app = express();
const server = http.createServer(app);
const io = socket(server); // Initialize Socket.io
notifyService.setIo(io);  // Pass io to notifyService

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bugs', require('./routes/bugs'));
app.use('/api/admin', require('./routes/admin'));



connectDB();

const PORT = process.env.PORT ;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 