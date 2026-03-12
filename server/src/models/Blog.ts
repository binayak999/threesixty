import mongoose, { Document, Schema } from 'mongoose';
import { ISeo, seoSchema } from './schemas/seo';

export type MediaRole = 'feature' | 'gallery' | 'video';

export interface IMediaItem {
  media: mongoose.Types.ObjectId;
  role: MediaRole; // 'feature' = one cover; 'gallery' = multiple images; 'video' = multiple videos
  order?: number;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  user: mongoose.Types.ObjectId;
  category?: mongoose.Types.ObjectId;
  /** Feature (one), gallery (multiple), video (multiple). Populate medias.media. */
  medias: IMediaItem[];
  tags: string[];
  readingTimeMinutes?: number;
  publishedAt?: Date;
  /** draft = not visible; pending = awaiting admin approval; published = visible to all */
  status: 'draft' | 'pending' | 'published';
  /** When true, can be highlighted as featured (e.g. on homepage) */
  isFeatured: boolean;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const mediaItemSchema = new Schema<IMediaItem>(
  {
    media: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
    role: { type: String, required: true, enum: ['feature', 'gallery', 'video'] },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    medias: [mediaItemSchema],
    tags: [{ type: String, trim: true }],
    readingTimeMinutes: { type: Number, min: 0 },
    publishedAt: { type: Date },
    status: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    seo: { type: seoSchema },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>('Blog', blogSchema);
