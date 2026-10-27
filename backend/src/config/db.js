
import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const configuredUri = process.env.MONGODB_URI?.trim();
  const isProduction = process.env.NODE_ENV === 'production';

  // Production must always use the configured persistent database.
  if (isProduction) {
    if (!configuredUri) {
      throw new Error(
        'MONGODB_URI is required in production. Configure it in Render.'
      );
    }

    try {
      console.log('Connecting to production MongoDB...');
      await mongoose.connect(configuredUri);
      console.log('MongoDB connected successfully.');
      return;
    } catch (error) {
      console.error(
        'Failed to connect to production MongoDB:',
        error.message
      );
      throw error;
    }
  }

  // Local development/testing: prefer the configured database.
  if (configuredUri) {
    try {
      await mongoose.connect(configuredUri);
      console.log('MongoDB connected successfully.');
      return;
    } catch (error) {
      console.warn(
        'Configured MongoDB connection failed:',
        error.message
      );
      // Continue to the local in-memory fallback only outside production.
    }
  }

  // Local development/testing only.
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');

    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create();
    }

    await mongoose.connect(mongoMemoryServer.getUri());
    console.log('Local in-memory MongoDB connected.');
  } catch (error) {
    console.error(
      'Could not start local in-memory MongoDB:',
      error.message
    );
    throw error;
  }
};

export const closeDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
    throw error;
  }
};
