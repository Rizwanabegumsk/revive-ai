import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';
import { connectDB } from './config/database';
import { Payment } from './models/Payment';
import { seedDatabaseData } from './services/seedService';

const PORT = process.env.PORT || 5000;

// Initialize Database Connection, verify dataset & start server
connectDB().then(async () => {
  try {
    const paymentCount = await Payment.countDocuments();
    if (paymentCount === 0) {
      console.log('🌱 Database is empty. Seeding initial demo dataset...');
      await seedDatabaseData(false);
    }
  } catch (err) {
    console.error('⚠️ Could not check/seed dataset on startup:', err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 REVIVE AI Backend API running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  });
});
