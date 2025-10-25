// MongoDB Configuration for FairLens
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fairlens';
    
    // Only try to connect if we have a valid MongoDB URI
    if (mongoURI && mongoURI !== 'mongodb://localhost:27017/fairlens') {
      const conn = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } else {
      console.log('MongoDB URI not configured or using default local URI. Skipping MongoDB connection.');
      return null;
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Continuing without MongoDB connection. Using mock data.');
    return null;
  }
};

module.exports = connectDB;