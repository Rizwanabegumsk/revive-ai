import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  const isProduction = process.env.NODE_ENV === 'production';
  let mongoUri = process.env.MONGODB_URI;

  if (isProduction) {
    if (!mongoUri || mongoUri.trim().length === 0) {
      console.error('❌ FATAL: MONGODB_URI environment variable is required in production mode (NODE_ENV=production).');
      process.exit(1);
    }

    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ Production MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
      return mongoUri;
    } catch (err) {
      console.error('❌ FATAL: Production MongoDB connection failed:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  }

  // Development mode connection (with local MongoDB or in-memory fallback)
  mongoUri = mongoUri || 'mongodb://127.0.0.1:27017/revive_ai';

  try {
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
    return mongoUri;
  } catch (error) {
    console.log('💡 Local MongoDB service not detected on port 27017.');
    console.log('🚀 Starting zero-dependency In-Memory MongoDB instance...');

    try {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'revive_ai'
        }
      });
      mongoUri = memoryServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
      return mongoUri;
    } catch (memError) {
      console.error('❌ FATAL: Could not connect to MongoDB or start In-Memory MongoDB instance.');
      console.error(memError instanceof Error ? memError.message : memError);
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
