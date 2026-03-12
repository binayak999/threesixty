import mongoose, { Document, Schema } from 'mongoose';
import { ISeo, seoSchema } from './schemas/seo';

export type CategoryType = 'listing' | 'blog';

export interface ICategory extends Document {
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  /** Font Awesome icon class (e.g. fa-house, fa-utensils) */
  icon?: string;
  parent?: mongoose.Types.ObjectId;
  order?: number;
  /** draft = not visible on public; published = visible */
  status: 'draft' | 'published';
  seo?: ISeo;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['listing', 'blog'], default: 'listing' },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    seo: { type: seoSchema },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1, type: 1 }, { unique: true });

export default mongoose.model<ICategory>('Category', categorySchema);
