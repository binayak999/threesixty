import mongoose, { Document, Schema } from 'mongoose';

export interface ICountry extends Document {
  code: string;       // Cny_Id from CSV (e.g. AD, AE, NP)
  name: string;      // Cny_Name
  slug: string;
  iso2?: string;
  iso3?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const countrySchema = new Schema<ICountry>(
  {
    code: { type: String, required: true, trim: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    iso2: { type: String, trim: true },
    iso3: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICountry>('Country', countrySchema);
