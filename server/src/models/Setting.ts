import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  applicationTitle: string;
  address: string;
  emailAddress: string;
  phone: string;
  faviconMediaId: string;
  faviconMediaUrl: string;
  dashboardLogoMediaId: string;
  dashboardLogoMediaUrl: string;
  websiteLogoMediaId: string;
  websiteLogoMediaUrl: string;
  headerBgMediaId: string;
  headerBgMediaUrl: string;
  footerBgMediaId: string;
  footerBgMediaUrl: string;
  language: string;
  timeZone: string;
  adminAlign: string;
  officeTime: string;
  latitudeLongitude: string;
  footerText: string;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    applicationTitle: { type: String, default: '360Nepal', trim: true },
    address: { type: String, default: '', trim: true },
    emailAddress: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    faviconMediaId: { type: String, default: '', trim: true },
    faviconMediaUrl: { type: String, default: '', trim: true },
    dashboardLogoMediaId: { type: String, default: '', trim: true },
    dashboardLogoMediaUrl: { type: String, default: '', trim: true },
    websiteLogoMediaId: { type: String, default: '', trim: true },
    websiteLogoMediaUrl: { type: String, default: '', trim: true },
    headerBgMediaId: { type: String, default: '', trim: true },
    headerBgMediaUrl: { type: String, default: '', trim: true },
    footerBgMediaId: { type: String, default: '', trim: true },
    footerBgMediaUrl: { type: String, default: '', trim: true },
    language: { type: String, default: 'en', trim: true },
    timeZone: { type: String, default: 'Asia/Kathmandu', trim: true },
    adminAlign: { type: String, default: 'ltr', trim: true },
    officeTime: { type: String, default: '', trim: true },
    latitudeLongitude: { type: String, default: '', trim: true },
    footerText: { type: String, default: '© 2024 360Nepal. All rights reserved.', trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISetting>('Setting', settingSchema);
