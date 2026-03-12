import { Schema } from 'mongoose';

export interface ISeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

export const seoSchema = new Schema<ISeo>(
  {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: [{ type: String, trim: true }],
    ogImage: { type: String, trim: true },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false }
);
