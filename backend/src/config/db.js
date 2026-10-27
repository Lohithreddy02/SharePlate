import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const configuredUri = process.env.MONGODB_URI;

    if (configuredUri && configuredUri.trim() !== '') {
      console.log(`Connecting to configured MongoDB at ${configuredUri.split('@')[1] || configuredUri}...`);
      await mongoose.connect(configuredUri);
      console.log('MongoDB connected successfully via MONGODB_URI.');
      return;
    }

    // In-memory fallback for local development & demonstration
    console.log('No external MONGODB_URI provided. Initializing in-memory MongoDB server...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`Embedded MongoDB started & connected at: ${uri}`);
  } catch (error) {
    console.error('Failed to connect to primary MongoDB. Attempting fallback to MongoMemoryServer...', error.message);
    try {
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`Embedded MongoDB fallback started successfully at: ${uri}`);
    } catch (fallbackError) {
      console.error('Fatal: Could not start or connect to any MongoDB instance:', fallbackError);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};
