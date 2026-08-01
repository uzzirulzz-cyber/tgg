import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

let cachedConnection = null;

export const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    cachedConnection = conn;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    // Retry logic for serverless
    setTimeout(connectDB, 5000);
    throw error;
  }
};

export const disconnectDB = async () => {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
    logger.info('MongoDB Disconnected');
  }
};
