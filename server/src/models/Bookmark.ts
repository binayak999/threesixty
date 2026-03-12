import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, listing: 1 }, { unique: true });

export default mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
