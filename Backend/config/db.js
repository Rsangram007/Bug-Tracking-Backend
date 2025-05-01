const mongoose = require('mongoose');
const { config } = require('dotenv');

// Load environment variables from .env file
config();

// MongoDB connection function
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
 
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure if connection fails
  }
};

// Export the connection function to use in server.js
module.exports = connectDB;