import { Router, Request, Response } from 'express';
import Blog from '../models/Blog';
import User from '../models/User';
import Media from '../models/Media';
import '../models/Tier';

const router = Router();

async function ensureMediaOwnership(mediaIds: string[], ownerId: string): Promise<boolean> {
  if (mediaIds.length === 0) return true;
  const docs = await Media.find({ _id: { $in: mediaIds } }).select('user').lean();
  const notOwned = docs.filter((m) => m.user == null || String(m.user) !== String(ownerId));
  return notOwned.length === 0;
}

const publishedFilter = { $or: [ { status: 'published' }, { status: { $exists: false } } ] };

function escapeRegex(s: string): string {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** URL-safe slug: lowercase, spaces to hyphens, strip non-alphanumeric except hyphen */
function slugify(s: string): string {
  if (!s || typeof s !== 'string') return '';
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function withNormalizedSlug<T extends { slug?: string }>(doc: T): T {
  if (!doc) return doc;
  const slug = doc.slug;
  const normalized = slug ? slugify(slug) || slug : slug;
  return { ...doc, slug: normalized };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const publishedOnly = req.query.publishedOnly === '1' || req.query.publishedOnly === 'true';
    const featuredOnly = req.query.featuredOnly === '1' || req.query.featuredOnly === 'true';
    const filter: Record<string, unknown> = publishedOnly ? { ...publishedFilter } : {};
    if (featuredOnly) filter.isFeatured = true;

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      filter.$and = (filter.$and as unknown[] || []).concat([
        { $or: [
          { title: re },
          { excerpt: re },
          { status: re },
        ] },
      ]);
    }

    const page = Math.max(1, parseInt(String(req.query.page || 1), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || 10), 10) || 10));
    const skip = (page - 1) * limit;

    const [blogsRaw, total] = await Promise.all([
      Blog.find(filter)
        .populate('user', 'name email')
        .populate('category', 'name slug')
        .populate({ path: 'medias.media', select: 'url urlMedium urlLow type' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);
    const blogs = (blogsRaw as { slug?: string }[]).map(withNormalizedSlug);

    res.json({
      success: true,
      data: blogs,
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
    const paramSlug = decodeURIComponent(req.params.slug);
    let blog = await Blog.findOne({ slug: paramSlug, ...publishedFilter })
      .populate('user', 'name email')
      .populate('category', 'name slug')
      .populate({ path: 'medias.media', select: 'url urlMedium urlLow type filename' })
      .lean();
    if (!blog) {
      const normalizedParam = slugify(paramSlug);
      if (normalizedParam) {
        const all = await Blog.find(publishedFilter).select('slug').lean();
        const match = (all as { slug?: string }[]).find((d) => slugify(d.slug || '') === normalizedParam);
        if (match) {
          blog = await Blog.findById(match._id)
            .populate('user', 'name email')
            .populate('category', 'name slug')
            .populate({ path: 'medias.media', select: 'url urlMedium urlLow type filename' })
            .lean();
        }
      }
    }
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    res.json({ success: true, data: withNormalizedSlug(blog as { slug?: string }) });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('user', 'name email')
      .populate('category', 'name slug')
      .populate({ path: 'medias.media', select: 'url urlMedium urlLow type filename' })
      .lean();
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    res.json({ success: true, data: withNormalizedSlug(blog as { slug?: string }) });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.body.user;
    if (!userId) {
      res.status(400).json({ success: false, message: 'user is required.' });
      return;
    }
    const requestingUser = await User.findById(userId).populate('tier').lean();
    if (!requestingUser) {
      res.status(403).json({ success: false, message: 'User not found.' });
      return;
    }
    let blogStatus: 'draft' | 'pending' | 'published' = 'draft';
    const isAdmin = requestingUser.role === 'admin' || (requestingUser as { role?: string }).role === 'superadmin';
    if (isAdmin) {
      blogStatus = req.body.status === 'draft' ? 'draft' : 'published';
    } else {
      const tier = requestingUser.tier as { maxBlogs?: number } | null;
      const maxBlogs = tier?.maxBlogs ?? 999;
      const count = await Blog.countDocuments({
        user: userId,
        status: { $in: ['pending', 'published'] },
      });
      if (count >= maxBlogs) {
        res.status(403).json({
          success: false,
          message: `Your plan allows up to ${maxBlogs} blog(s). Upgrade or contact support.`,
        });
        return;
      }
      blogStatus = 'pending';
    }
    const medias = Array.isArray(req.body.medias) ? req.body.medias : [];
    const mediaIds = medias.map((m: { media?: string }) => m?.media).filter(Boolean);
    const mediaOwned = await ensureMediaOwnership(mediaIds, userId);
    if (!mediaOwned) {
      res.status(400).json({ success: false, message: 'You can only use your own media on a blog.' });
      return;
    }
    const slugRaw = req.body.slug || req.body.title || '';
    const slugNormalized = slugify(String(slugRaw)) || slugify(String(req.body.title || '')) || `blog-${Date.now()}`;
    const blog = await Blog.create({
      ...req.body,
      status: blogStatus,
      slug: slugNormalized,
    });
    res.status(201).json({ success: true, data: withNormalizedSlug(blog.toObject() as { slug?: string }) });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { isFeatured } = req.body;
    if (typeof isFeatured !== 'boolean') {
      res.status(400).json({ success: false, message: 'isFeatured (boolean) is required.' });
      return;
    }
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { isFeatured },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('category', 'name slug')
      .populate({ path: 'medias.media', select: 'url urlMedium urlLow type filename' })
      .lean();
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    res.json({ success: true, data: withNormalizedSlug(blog as { slug?: string }) });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await Blog.findById(req.params.id).select('user').lean();
    if (!existing) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    const update: Record<string, unknown> = { ...req.body };
    if (update.slug != null && typeof update.slug === 'string') {
      update.slug = slugify(update.slug) || update.slug.trim();
    }
    const medias = Array.isArray(update.medias) ? update.medias : [];
    const mediaIds = medias.map((m: { media?: string }) => m?.media).filter(Boolean);
    const ownerId = String(existing.user);
    const mediaOwned = await ensureMediaOwnership(mediaIds, ownerId);
    if (!mediaOwned) {
      res.status(400).json({ success: false, message: 'You can only use your own media on a blog.' });
      return;
    }
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('category', 'name slug')
      .populate({ path: 'medias.media', select: 'url urlMedium urlLow type filename' })
      .lean();
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    res.json({ success: true, data: withNormalizedSlug(blog as { slug?: string }) });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      res.status(404).json({ success: false, message: 'Blog not found' });
      return;
    }
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
