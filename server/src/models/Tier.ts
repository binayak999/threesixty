import mongoose, { Document, Schema } from 'mongoose';

export interface ITier extends Document {
  name: string;
  slug: string;
  description?: string;
  maxListings: number;
  maxBlogs: number;
  maxVideos: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tierSchema = new Schema<ITier>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    maxListings: { type: Number, required: true, default: 0, min: 0 },
    maxBlogs: { type: Number, required: true, default: 0, min: 0 },
    maxVideos: { type: Number, required: true, default: 0, min: 0 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITier>('Tier', tierSchema);
