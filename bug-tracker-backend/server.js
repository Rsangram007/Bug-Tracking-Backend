const express = require('express');
const http = require('http');
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bugs', require('./routes/bugs'));
app.use('/api/admin', require('./routes/admin'));



connectDB();

app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Welcome</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f4; }
            h1 { color: #333; }
            p { color: #666; font-size: 18px; }
          </style>
        </head>
        <body>
          <h1>Welcome to Our API</h1>
          <p>We're glad to have you here! 🚀</p>
        </body>
      </html>
    `);
  });

const PORT = process.env.PORT ;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 