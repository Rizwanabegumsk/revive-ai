import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB, disconnectDB } from '../config/database';
import { seedDatabaseData } from '../services/seedService';

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await connectDB();

    const result = await seedDatabaseData(true);

    console.log(`✅ Seed completed successfully! (${result.customersCount} customers, ${result.paymentsCount} payments, ${result.decisionsCount} decisions, ${result.outcomesCount} outcomes)`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed with error:', error);
    process.exit(1);
  }
};

seedDatabase();
