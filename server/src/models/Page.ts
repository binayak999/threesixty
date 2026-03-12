import mongoose, { Document, Schema } from 'mongoose';
import { ISeo, seoSchema } from './schemas/seo';

export interface IPage extends Document {
  title: string;
  slug: string;
  /** Banner image; ref to Media. Optional. */
  banner?: mongoose.Types.ObjectId;
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    banner: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    seo: { type: seoSchema },
  },
  { timestamps: true }
);

export default mongoose.model<IPage>('Page', pageSchema);
