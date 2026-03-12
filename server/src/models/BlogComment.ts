import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogComment extends Document {
  blog: mongoose.Types.ObjectId;
  /** Logged-in user; optional for guest comments */
  user?: mongoose.Types.ObjectId;
  /** Guest author name when user is not set */
  authorName: string;
  /** Guest author email when user is not set */
  authorEmail: string;
  content: string;
  /** Parent comment for nested replies; null/undefined = top-level comment */
  parent?: mongoose.Types.ObjectId;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogCommentSchema = new Schema<IBlogComment>(
  {
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    authorName: { type: String, required: true, trim: true },
    authorEmail: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: 'BlogComment', default: null },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

blogCommentSchema.index({ blog: 1, isApproved: 1, createdAt: 1 });
blogCommentSchema.index({ blog: 1, parent: 1, isApproved: 1 });

export default mongoose.model<IBlogComment>('BlogComment', blogCommentSchema);
