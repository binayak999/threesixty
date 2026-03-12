import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export interface IUser extends Document {
  email: string;
  name: string;
  passwordHash?: string;
  role: 'user' | 'admin';
  tier?: mongoose.Types.ObjectId;
  bio?: string;
  avatar?: mongoose.Types.ObjectId;
  socialLinks?: IUserSocialLinks;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    tier: { type: Schema.Types.ObjectId, ref: 'Tier', default: null },
    bio: { type: String, trim: true },
    avatar: { type: Schema.Types.ObjectId, ref: 'Media' },
    socialLinks: {
      instagram: { type: String, trim: true },
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
