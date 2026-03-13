import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Media from '../models/Media';
import { processMediaFile } from '../services/mediaProcessor';

const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:4000';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = Date.now() + '-' + (file.originalname || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

function getMediaType(mime: string, typeFromForm?: string): string {
  if (typeFromForm && ['image', '360', 'video', 'audio', 'file'].includes(typeFromForm)) {
    return typeFromForm;
  }
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'file';
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
  };
  return map[mime] || '';
}

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.query.userId as string) || undefined;
    if (!userId) {
      res.json({ success: true, data: [] });
      return;
    }
    const list = await Media.find({ user: userId }).sort({ createdAt: -1 }).lean();
    const items = list.map((doc) => ({
      id: String(doc._id),
      url: doc.url.startsWith('http') ? doc.url : `${BASE_URL}${doc.url}`,
      urlMedium: doc.urlMedium ? `${BASE_URL}${doc.urlMedium}` : undefined,
      urlLow: doc.urlLow ? `${BASE_URL}${doc.urlLow}` : undefined,
      type: doc.type,
      filename: doc.filename,
      mimeType: doc.mimeType,
      size: doc.size,
      sizeMedium: doc.sizeMedium,
      sizeLow: doc.sizeLow,
      createdAt: doc.createdAt,
    }));
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('Media list error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/upload', upload.array('files', 20) as unknown as express.RequestHandler, async (req: Request, res: Response): Promise<void> => {
  try {
    const typeFromForm = (req.body?.type as string) || 'file';
    const userId = (req.body?.userId as string) || undefined;
    const files = (req.files as Express.Multer.File[]) || [];
    const created: Array<{
      id: string; url: string; urlMedium?: string; urlLow?: string; type: string;
      filename?: string; mimeType?: string; size?: number; sizeMedium?: number; sizeLow?: number; createdAt?: Date;
    }> = [];

    for (const file of files) {
      const urlPath = '/uploads/' + file.filename;
      const type = getMediaType(file.mimetype, typeFromForm);
      const filePath = path.join(UPLOAD_DIR, file.filename);
      const variants = await processMediaFile(filePath, file.mimetype);
      const media = await Media.create({
        url: urlPath,
        urlMedium: variants.urlMedium,
        urlLow: variants.urlLow,
        type,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        sizeMedium: variants.sizeMedium,
        sizeLow: variants.sizeLow,
        user: userId || undefined,
      });
      created.push({
        id: String(media._id),
        url: `${BASE_URL}${urlPath}`,
        urlMedium: media.urlMedium ? `${BASE_URL}${media.urlMedium}` : undefined,
        urlLow: media.urlLow ? `${BASE_URL}${media.urlLow}` : undefined,
        type,
        filename: media.filename,
        mimeType: media.mimeType,
        size: media.size,
        sizeMedium: media.sizeMedium,
        sizeLow: media.sizeLow,
        createdAt: media.createdAt,
      });
    }

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Media upload error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string | undefined;
    const doc = await Media.findById(req.params.id).lean();
    if (!doc) {
      res.status(404).json({ success: false, message: 'Media not found' });
      return;
    }
    const ownerId = doc.user ? String(doc.user) : null;
    if (userId && ownerId && ownerId !== userId) {
      res.status(403).json({ success: false, message: 'You can only delete your own media.' });
      return;
    }
    if (!userId && ownerId) {
      res.status(401).json({ success: false, message: 'Authentication required to delete this media.' });
      return;
    }
    const urlPath = doc.url;
    if (urlPath && !urlPath.startsWith('http')) {
      const filePath = path.join(process.cwd(), urlPath.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (doc.urlMedium) {
        const mediumPath = path.join(process.cwd(), doc.urlMedium.replace(/^\//, ''));
        if (fs.existsSync(mediumPath)) fs.unlinkSync(mediumPath);
      }
      if (doc.urlLow) {
        const lowPath = path.join(process.cwd(), doc.urlLow.replace(/^\//, ''));
        if (fs.existsSync(lowPath)) fs.unlinkSync(lowPath);
      }
    }
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media deleted' });
  } catch (err) {
    console.error('Media delete error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/import-url', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, userId } = req.body as { url?: string; userId?: string };
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, message: 'URL is required.' });
      return;
    }
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      res.status(400).json({ success: false, message: 'Invalid URL. Use http or https.' });
      return;
    }
    const response = await fetch(trimmed, {
      method: 'GET',
      headers: { 'User-Agent': '360Nepal-MediaImport/1.0' },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      res.status(400).json({ success: false, message: `Failed to fetch URL: ${response.status}` });
      return;
    }
    const contentType = response.headers.get('content-type') || '';
    const buffer = Buffer.from(await response.arrayBuffer());
    const mimePart = contentType.split(';')[0].trim();
    const urlPathname = new URL(trimmed).pathname;
    const ext = getExtFromMime(mimePart) || path.extname(urlPathname) || '.bin';
    const baseName = path.basename(urlPathname) || 'import';
    const nameWithoutExt = path.extname(baseName) ? baseName.slice(0, -path.extname(baseName).length) : baseName;
    const safeFilename = (Date.now() + '-' + (nameWithoutExt || 'import').replace(/[^a-zA-Z0-9.-]/g, '_') + ext).replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = path.join(UPLOAD_DIR, safeFilename);
    fs.writeFileSync(filePath, buffer);
    const urlPath = '/uploads/' + safeFilename;
    const type = getMediaType(mimePart);
    const variants = await processMediaFile(filePath, mimePart || '');
    const media = await Media.create({
      url: urlPath,
      urlMedium: variants.urlMedium,
      urlLow: variants.urlLow,
      type,
      filename: safeFilename,
      mimeType: mimePart || undefined,
      size: buffer.length,
      sizeMedium: variants.sizeMedium,
      sizeLow: variants.sizeLow,
      user: userId || undefined,
    });
    res.status(201).json({
      success: true,
      data: {
        id: String(media._id),
        url: `${BASE_URL}${urlPath}`,
        urlMedium: media.urlMedium ? `${BASE_URL}${media.urlMedium}` : undefined,
        urlLow: media.urlLow ? `${BASE_URL}${media.urlLow}` : undefined,
        type: media.type,
        filename: media.filename,
        mimeType: media.mimeType,
        size: media.size,
        sizeMedium: media.sizeMedium,
        sizeLow: media.sizeLow,
        createdAt: media.createdAt,
      },
    });
  } catch (err) {
    console.error('Media import-url error:', err);
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
