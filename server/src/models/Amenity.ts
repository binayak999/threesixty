import mongoose, { Document, Schema } from 'mongoose';

export interface IAmenity extends Document {
  name: string;
  icon: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const amenitySchema = new Schema<IAmenity>(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, trim: true },
    slug: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAmenity>('Amenity', amenitySchema);
