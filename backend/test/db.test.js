import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';

describe('Database Connection Module (connectDB)', () => {
  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv };
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  afterEach(async () => {
    process.env = originalEnv;
    await closeDB();
  });

  it('fails with a clear error in production if MONGODB_URI is missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;

    await expect(connectDB()).rejects.toThrow(
      /Fatal Error: MONGODB_URI environment variable is missing in production/i
    );
  });

  it('fails with a clear error in production if MONGODB_URI is empty whitespace', async () => {
    process.env.NODE_ENV = 'production';
    process.env.MONGODB_URI = '   ';

    await expect(connectDB()).rejects.toThrow(
      /Fatal Error: MONGODB_URI environment variable is missing in production/i
    );
  });

  it('in production, attempts connection to MONGODB_URI and does not use in-memory fallback', async () => {
    process.env.NODE_ENV = 'production';
    process.env.MONGODB_URI = 'mongodb://mock-cluster0.mongodb.net/shareplate';

    const connectSpy = vi.spyOn(mongoose, 'connect').mockResolvedValueOnce(true);

    await connectDB();

    expect(connectSpy).toHaveBeenCalledWith('mongodb://mock-cluster0.mongodb.net/shareplate');
    connectSpy.mockRestore();
  });

  it('in development, falls back to in-memory database when MONGODB_URI is absent', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;

    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});
