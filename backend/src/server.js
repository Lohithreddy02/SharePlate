import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`SharePlate API Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });

    const handleExit = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
      server.close(async () => {
        await closeDB();
        console.log('Server and database connections closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleExit('SIGINT'));
    process.on('SIGTERM', () => handleExit('SIGTERM'));
  } catch (err) {
    console.error('Failed to start SharePlate backend server:', err);
    process.exit(1);
  }
};

startServer();
