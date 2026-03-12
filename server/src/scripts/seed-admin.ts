/**
 * Seeder: create or update an admin account.
 * Usage: npx ts-node src/scripts/seed-admin.ts
 * Or with env: ADMIN_EMAIL=admin@360nepal.com ADMIN_PASSWORD=yourpassword npx ts-node src/scripts/seed-admin.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/threesixtynepal';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@360nepal.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = process.env.ADMIN_NAME || '360Nepal Admin';

const BCRYPT_ROUNDS = 10;

async function seedAdmin(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      existing.name = ADMIN_NAME;
      existing.passwordHash = passwordHash;
      existing.role = 'admin';
      await existing.save();
      console.log(`Admin updated: ${ADMIN_EMAIL}`);
    } else {
      await User.create({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        passwordHash,
        role: 'admin',
      });
      console.log(`Admin created: ${ADMIN_EMAIL}`);
    }

    console.log('Done. You can sign in with the admin email and password.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

seedAdmin();
