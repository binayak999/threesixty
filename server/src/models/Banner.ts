import mongoose, { Document, Schema } from 'mongoose';

export type BannerType = 'homebanner' | 'adsbanner';

export interface IBanner extends Document {
  title: string;
  media: mongoose.Types.ObjectId;
  /** When true, render as 360° image view; when false, normal image view */
  is360: boolean;
  /** homebanner = hero on home; adsbanner = ad placement elsewhere */
  bannerType: BannerType;
  /** Optional URL; when set and not "#", clicking the banner redirects here */
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    media: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
    is360: { type: Boolean, default: false },
    bannerType: { type: String, enum: ['homebanner', 'adsbanner'], default: 'homebanner' },
    link: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<IBanner>('Banner', bannerSchema);
