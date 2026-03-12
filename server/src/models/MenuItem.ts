import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem extends Document {
  listing: mongoose.Types.ObjectId;
  title: string;
  detail?: string;
  price: number;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    title: { type: String, required: true, trim: true },
    detail: { type: String, trim: true },
    price: { type: Number, required: true },
    label: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
