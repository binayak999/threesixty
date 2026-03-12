import mongoose, { Document, Schema } from 'mongoose';
import { ISeo, seoSchema } from './schemas/seo';

export interface IOpeningHours {
  dayOfWeek: string;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
}

export type MediaRole = 'feature' | 'gallery' | 'video';

export interface IMediaItem {
  media: mongoose.Types.ObjectId;
  role: MediaRole; // 'feature' = one cover; 'gallery' = multiple images; 'video' = multiple videos
  order?: number;
}

export interface IListing extends Document {
  title: string;
  description: string;
  slug: string;
  category: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  /** Feature (one), gallery (multiple), video (multiple). Populate medias.media. */
  medias: IMediaItem[];
  amenities: mongoose.Types.ObjectId[];
  user: mongoose.Types.ObjectId;
  publishedAt?: Date;
  openingHours: IOpeningHours[];
  /** draft = not visible; pending = awaiting admin approval; published = visible to all */
  status: 'draft' | 'pending' | 'published';
  /** When true, can be highlighted as featured (e.g. on homepage) */
  isFeatured: boolean;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const openingHoursSchema = new Schema<IOpeningHours>(
  {
    dayOfWeek: { type: String, required: true, trim: true },
    openTime: { type: String, trim: true },
    closeTime: { type: String, trim: true },
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const mediaItemSchema = new Schema<IMediaItem>(
  {
    media: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
    role: { type: String, required: true, enum: ['feature', 'gallery', 'video'] },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const listingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, trim: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    medias: [mediaItemSchema],
    amenities: [{ type: Schema.Types.ObjectId, ref: 'Amenity' }],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date },
    openingHours: [openingHoursSchema],
    status: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    seo: { type: seoSchema },
  },
  { timestamps: true }
);

export default mongoose.model<IListing>('Listing', listingSchema);
