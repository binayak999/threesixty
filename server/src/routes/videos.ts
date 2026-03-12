import { Router, Request, Response } from 'express';
import Video from '../models/Video';
import User from '../models/User';
import '../models/Tier';

const router = Router();

const publishedFilter = { $or: [ { status: 'published' }, { status: { $exists: false } } ] };

function escapeRegex(s: string): string {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const all = req.query.all === '1' || req.query.all === 'true';
    const filter: Record<string, unknown> = all ? {} : { ...publishedFilter };
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$and = (filter.$and as unknown[] || []).concat([
        { $or: [
          { title: re },
          { youtubeLink: re },
          { status: re },
        ] },
      ]);
    }

    const page = Math.max(1, parseInt(String(req.query.page || 1), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || 10), 10) || 10));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Video.find(filter)
        .populate('thumbnail')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Video.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Video.findById(req.params.id)
      .populate('thumbnail')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Video not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, youtubeLink, thumbnail, userId } = req.body;
    if (!title || !youtubeLink) {
      res.status(400).json({ success: false, message: 'title and youtubeLink are required' });
      return;
    }
    let status: 'pending' | 'published' = 'published';
    let user: string | null = null;
    if (userId) {
      const requestingUser = await User.findById(userId).populate('tier').lean();
      if (requestingUser) {
        user = userId;
        const isAdmin = requestingUser.role === 'admin' || (requestingUser as { role?: string }).role === 'superadmin';
        status = isAdmin ? 'published' : 'pending';
        if (!isAdmin) {
          const tier = requestingUser.tier as { maxVideos?: number } | null;
          const maxVideos = tier?.maxVideos ?? 999;
          const count = await Video.countDocuments({
            user: userId,
            status: { $in: ['pending', 'published'] },
          });
          if (count >= maxVideos) {
            res.status(403).json({
              success: false,
              message: `Your plan allows up to ${maxVideos} video(s). Upgrade or contact support.`,
            });
            return;
          }
        }
      }
    }
    const item = await Video.create({
      title: String(title).trim(),
      youtubeLink: String(youtubeLink).trim(),
      thumbnail: thumbnail || undefined,
      user: user || undefined,
      status,
    });
    const populated = await Video.findById(item._id).populate('thumbnail').populate('user', 'name email').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, youtubeLink, thumbnail, status } = req.body;
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = String(title).trim();
    if (youtubeLink !== undefined) update.youtubeLink = String(youtubeLink).trim();
    if (thumbnail !== undefined) update.thumbnail = thumbnail;
    if (status === 'pending' || status === 'published') update.status = status;
    const item = await Video.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('thumbnail')
      .populate('user', 'name email')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Video not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Video.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Video not found' });
      return;
    }
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
