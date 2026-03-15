import { Router, Request, Response } from 'express';
import Banner from '../models/Banner';
import { getSessionFromCookie } from '../lib/session';

const router = Router();

function requireSessionForCreate(req: Request, res: Response, next: () => void): void {
  const user = getSessionFromCookie(req.headers.cookie);
  if (!user?.id) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  next();
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const bannerType = req.query.bannerType as string | undefined;
    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam != null ? Math.min(Math.max(1, parseInt(limitParam, 10) || 0), 50) : undefined;
    let filter: Record<string, unknown> = {};
    if (bannerType === 'homebanner') {
      filter = { $or: [ { bannerType: 'homebanner' }, { bannerType: { $exists: false } } ] };
    } else if (bannerType === 'adsbanner') {
      filter = { bannerType: 'adsbanner' };
    }
    let query = Banner.find(filter).populate('media').sort({ createdAt: -1 });
    if (limit != null && limit > 0) query = query.limit(limit);
    const items = await query.lean();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Banner.findById(req.params.id)
      .populate('media')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Banner not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', requireSessionForCreate, async (req: Request, res: Response) => {
  try {
    const { title, media, is360, bannerType, link } = req.body;
    if (!title || !media) {
      res.status(400).json({ success: false, message: 'title and media are required' });
      return;
    }
    const item = await Banner.create({
      title: String(title).trim(),
      media,
      is360: is360 === true || is360 === 'true',
      bannerType: bannerType === 'adsbanner' ? 'adsbanner' : 'homebanner',
      link: link != null && String(link).trim() ? String(link).trim() : undefined,
    });
    const populated = await Banner.findById(item._id).populate('media').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, media, is360, bannerType, link } = req.body;
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = String(title).trim();
    if (media !== undefined) update.media = media;
    if (is360 !== undefined) update.is360 = is360 === true || is360 === 'true';
    if (bannerType === 'adsbanner' || bannerType === 'homebanner') update.bannerType = bannerType;
    if (link !== undefined) update.link = link != null && String(link).trim() ? String(link).trim() : '';
    const item = await Banner.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('media')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Banner not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Banner.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Banner not found' });
      return;
    }
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
