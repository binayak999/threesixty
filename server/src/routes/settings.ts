import { Router, Request, Response } from 'express';
import Setting from '../models/Setting';

const router = Router();

const DEFAULT_SETTINGS = {
  applicationTitle: '360Nepal',
  address: '',
  emailAddress: '',
  phone: '',
  faviconMediaId: '',
  faviconMediaUrl: '',
  dashboardLogoMediaId: '',
  dashboardLogoMediaUrl: '',
  websiteLogoMediaId: '',
  websiteLogoMediaUrl: '',
  headerBgMediaId: '',
  headerBgMediaUrl: '',
  footerBgMediaId: '',
  footerBgMediaUrl: '',
  language: 'en',
  timeZone: 'Asia/Kathmandu',
  adminAlign: 'ltr',
  officeTime: '',
  latitudeLongitude: '',
  footerText: '© 2024 360Nepal. All rights reserved.',
};

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const doc = await Setting.findOne().lean();
    const data = doc ? {
      applicationTitle: doc.applicationTitle ?? DEFAULT_SETTINGS.applicationTitle,
      address: doc.address ?? DEFAULT_SETTINGS.address,
      emailAddress: doc.emailAddress ?? DEFAULT_SETTINGS.emailAddress,
      phone: doc.phone ?? DEFAULT_SETTINGS.phone,
      faviconMediaId: doc.faviconMediaId ?? '',
      faviconMediaUrl: doc.faviconMediaUrl ?? '',
      dashboardLogoMediaId: doc.dashboardLogoMediaId ?? '',
      dashboardLogoMediaUrl: doc.dashboardLogoMediaUrl ?? '',
      websiteLogoMediaId: doc.websiteLogoMediaId ?? '',
      websiteLogoMediaUrl: doc.websiteLogoMediaUrl ?? '',
      headerBgMediaId: doc.headerBgMediaId ?? '',
      headerBgMediaUrl: doc.headerBgMediaUrl ?? '',
      footerBgMediaId: doc.footerBgMediaId ?? '',
      footerBgMediaUrl: doc.footerBgMediaUrl ?? '',
      language: doc.language ?? DEFAULT_SETTINGS.language,
      timeZone: doc.timeZone ?? DEFAULT_SETTINGS.timeZone,
      adminAlign: doc.adminAlign ?? DEFAULT_SETTINGS.adminAlign,
      officeTime: doc.officeTime ?? DEFAULT_SETTINGS.officeTime,
      latitudeLongitude: doc.latitudeLongitude ?? DEFAULT_SETTINGS.latitudeLongitude,
      footerText: doc.footerText ?? DEFAULT_SETTINGS.footerText,
    } : DEFAULT_SETTINGS;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.put('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    const allowed = [
      'applicationTitle', 'address', 'emailAddress', 'phone',
      'faviconMediaId', 'faviconMediaUrl', 'dashboardLogoMediaId', 'dashboardLogoMediaUrl',
      'websiteLogoMediaId', 'websiteLogoMediaUrl', 'headerBgMediaId', 'headerBgMediaUrl',
      'footerBgMediaId', 'footerBgMediaUrl', 'language', 'timeZone', 'adminAlign',
      'officeTime', 'latitudeLongitude', 'footerText',
    ];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        update[key] = typeof body[key] === 'string' ? body[key] : String(body[key] ?? '');
      }
    }
    const doc = await Setting.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    const data = {
      applicationTitle: doc?.applicationTitle ?? DEFAULT_SETTINGS.applicationTitle,
      address: doc?.address ?? DEFAULT_SETTINGS.address,
      emailAddress: doc?.emailAddress ?? DEFAULT_SETTINGS.emailAddress,
      phone: doc?.phone ?? DEFAULT_SETTINGS.phone,
      faviconMediaId: doc?.faviconMediaId ?? '',
      faviconMediaUrl: doc?.faviconMediaUrl ?? '',
      dashboardLogoMediaId: doc?.dashboardLogoMediaId ?? '',
      dashboardLogoMediaUrl: doc?.dashboardLogoMediaUrl ?? '',
      websiteLogoMediaId: doc?.websiteLogoMediaId ?? '',
      websiteLogoMediaUrl: doc?.websiteLogoMediaUrl ?? '',
      headerBgMediaId: doc?.headerBgMediaId ?? '',
      headerBgMediaUrl: doc?.headerBgMediaUrl ?? '',
      footerBgMediaId: doc?.footerBgMediaId ?? '',
      footerBgMediaUrl: doc?.footerBgMediaUrl ?? '',
      language: doc?.language ?? DEFAULT_SETTINGS.language,
      timeZone: doc?.timeZone ?? DEFAULT_SETTINGS.timeZone,
      adminAlign: doc?.adminAlign ?? DEFAULT_SETTINGS.adminAlign,
      officeTime: doc?.officeTime ?? DEFAULT_SETTINGS.officeTime,
      latitudeLongitude: doc?.latitudeLongitude ?? DEFAULT_SETTINGS.latitudeLongitude,
      footerText: doc?.footerText ?? DEFAULT_SETTINGS.footerText,
    };
    res.json({ success: true, message: 'Settings saved.', data });
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
