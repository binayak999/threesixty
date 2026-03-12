import { Router, Request, Response } from 'express';
import Page from '../models/Page';

const router = Router();

function escapeRegex(s: string): string {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { title: re },
        { slug: re },
      ];
    }

    const page = Math.max(1, parseInt(String(req.query.page || 1), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || 10), 10) || 10));
    const skip = (page - 1) * limit;

    const query = Object.keys(filter).length ? Page.find(filter) : Page.find();
    const [items, total] = await Promise.all([
      query
        .populate('banner')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Object.keys(filter).length ? Page.countDocuments(filter) : Page.countDocuments(),
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

router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const item = await Page.findOne({ slug: req.params.slug })
      .populate('banner')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Page.findById(req.params.id)
      .populate('banner')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, slug, banner, seo } = req.body;
    if (!title || !slug) {
      res.status(400).json({ success: false, message: 'title and slug are required' });
      return;
    }
    const slugNorm = String(slug).trim().toLowerCase().replace(/\s+/g, '-');
    const item = await Page.create({
      title: String(title).trim(),
      slug: slugNorm,
      banner: banner || undefined,
      seo: seo && typeof seo === 'object' ? seo : undefined,
    });
    const populated = await Page.findById(item._id).populate('banner').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, slug, banner, seo } = req.body;
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = String(title).trim();
    if (slug !== undefined) {
      update.slug = String(slug).trim().toLowerCase().replace(/\s+/g, '-');
    }
    if (banner !== undefined) update.banner = banner || null;
    if (seo !== undefined) update.seo = seo && typeof seo === 'object' ? seo : undefined;
    const item = await Page.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('banner')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Page.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
