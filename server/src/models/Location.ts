import mongoose, { Document, Schema } from 'mongoose';
import { ISeo, seoSchema } from './schemas/seo';

export interface ILocation extends Document {
  name: string;
  slug: string;
  address?: string;
  city?: string;
  region?: string;
  /** Reference to Country model; use this to avoid duplicating country data. */
  countryRef?: mongoose.Types.ObjectId;
  /** Legacy / display: country name string. When countryRef is populated, use countryRef.name. */
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  isActive: boolean;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    region: { type: String, trim: true },
    countryRef: { type: Schema.Types.ObjectId, ref: 'Country' },
    country: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    seo: { type: seoSchema },
  },
  { timestamps: true }
);

export default mongoose.model<ILocation>('Location', locationSchema);
