import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  listing: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  helpfulCount: number;
  reviewMedias: mongoose.Types.ObjectId[];
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Review', default: null },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: true },
    helpfulCount: { type: Number, default: 0 },
    reviewMedias: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', reviewSchema);
