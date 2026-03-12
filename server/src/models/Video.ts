import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  youtubeLink: string;
  thumbnail?: mongoose.Types.ObjectId;
  /** Submitter; when set and status is pending, only admins can approve */
  user?: mongoose.Types.ObjectId;
  /** pending = awaiting admin approval; published = visible to all. Default published for backward compat. */
  status: 'pending' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true },
    youtubeLink: { type: String, required: true, trim: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['pending', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export default mongoose.model<IVideo>('Video', videoSchema);
