import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  url: string;
  /** Medium quality variant (compressed). */
  urlMedium?: string;
  /** Low quality variant (compressed). */
  urlLow?: string;
  type: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  sizeMedium?: number;
  sizeLow?: number;
  /** Owner; media is only listable/deletable by this user. */
  user?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true, trim: true },
    urlMedium: { type: String, trim: true },
    urlLow: { type: String, trim: true },
    type: { type: String, required: true, trim: true },
    filename: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number },
    sizeMedium: { type: Number },
    sizeLow: { type: Number },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IMedia>('Media', mediaSchema);
