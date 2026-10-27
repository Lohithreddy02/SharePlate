import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredUri = process.env.MONGODB_URI;

  // In production, an external MongoDB database (e.g. MongoDB Atlas) is strictly required
  if (isProduction) {
    if (!configuredUri || configuredUri.trim() === '') {
      const errorMessage =
        'Fatal Error: MONGODB_URI environment variable is missing in production. ' +
        'Please configure MONGODB_URI in your production environment settings (e.g. Render Dashboard).';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      console.log('Connecting to production MongoDB database...');
      await mongoose.connect(configuredUri.trim());
      console.log('MongoDB connected successfully via MONGODB_URI.');
      return;
    } catch (error) {
      console.error('Fatal Error: Failed to connect to MongoDB in production:', error.message);
      throw error;
    }
  }

  // In local development / testing environment:
  if (configuredUri && configuredUri.trim() !== '') {
    try {
      console.log('Connecting to configured MongoDB...');
      await mongoose.connect(configuredUri.trim());
      console.log('MongoDB connected successfully via MONGODB_URI.');
      return;
    } catch (error) {
      console.warn('Could not connect to configured MongoDB. Falling back to in-memory database for local development:', error.message);
    }
  }

  // Fallback to in-memory MongoDB ONLY for local development or testing
  console.log('No external MongoDB connected. Initializing in-memory MongoDB server for local development...');
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!mongoMemoryServer) {
      mongoMemoryServer = await MongoMemoryServer.create();
    }
    const uri = mongoMemoryServer.getUri();
    await mongoose.connect(uri);
    console.log('Embedded in-memory MongoDB started & connected successfully for development.');
  } catch (fallbackError) {
    console.error(
      `Fatal: Failed to initialize in-memory MongoDB server: ${fallbackError.message}.\n` +
      'Tip: For local development without an external MongoDB, run "npm install" in the backend directory to ensure "mongodb-memory-server" is installed, or configure MONGODB_URI in your .env file.'
    );
    throw fallbackError;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
  } catch (err) {
    console.error('Error closing MongoDB connection:', err.message);
  }
};
