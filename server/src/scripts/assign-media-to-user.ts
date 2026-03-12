/**
 * One-time script: assign all media without an owner to a single user.
 * Uses the first user in the database (or set ASSIGN_MEDIA_USER_ID / ASSIGN_MEDIA_USER_EMAIL).
 * Usage: npx ts-node src/scripts/assign-media-to-user.ts
 * Or: ASSIGN_MEDIA_USER_EMAIL=you@example.com npx ts-node src/scripts/assign-media-to-user.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';
import Media from '../models/Media';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/threesixtynepal';
const ASSIGN_MEDIA_USER_ID = process.env.ASSIGN_MEDIA_USER_ID as string | undefined;
const ASSIGN_MEDIA_USER_EMAIL = process.env.ASSIGN_MEDIA_USER_EMAIL as string | undefined;

async function assignMediaToUser(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    let user;
    if (ASSIGN_MEDIA_USER_ID) {
      user = await User.findById(ASSIGN_MEDIA_USER_ID).lean();
      if (!user) {
        console.error('User not found for id:', ASSIGN_MEDIA_USER_ID);
        process.exit(1);
      }
    } else if (ASSIGN_MEDIA_USER_EMAIL) {
      user = await User.findOne({ email: ASSIGN_MEDIA_USER_EMAIL }).lean();
      if (!user) {
        console.error('User not found for email:', ASSIGN_MEDIA_USER_EMAIL);
        process.exit(1);
      }
    } else {
      user = await User.findOne().sort({ createdAt: 1 }).lean();
      if (!user) {
        console.error('No user found in the database. Create a user first.');
        process.exit(1);
      }
    }

    const userId = (user as { _id: mongoose.Types.ObjectId })._id;
    const result = await Media.updateMany(
      { $or: [{ user: null }, { user: { $exists: false } }] },
      { $set: { user: userId } }
    );

    console.log(`Assigned ${result.modifiedCount} media item(s) to user ${(user as { email?: string }).email ?? userId}`);
    console.log('Done.');
  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

assignMediaToUser();
