import { Router, Request, Response } from 'express';
import Category from '../models/Category';

const router = Router();

const publishedFilter = { $or: [ { status: 'published' }, { status: { $exists: false } } ] };

router.get('/', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string | undefined;
    const publishedOnly = req.query.publishedOnly === '1' || req.query.publishedOnly === 'true';
    const parentOnly = req.query.parentOnly === '1' || req.query.parentOnly === 'true';
    const filter: Record<string, unknown> = type === 'listing' || type === 'blog' ? { type } : {};
    if (publishedOnly) Object.assign(filter, publishedFilter);
    if (parentOnly) filter.$or = [{ parent: null }, { parent: { $exists: false } }];
    const categories = await Category.find(filter).sort({ order: 1, name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, slug, type, description, icon, parent, order, status, seo } = req.body;
    if (!name || !slug || !type || (type !== 'listing' && type !== 'blog')) {
      res.status(400).json({ success: false, message: 'name, slug and type (listing|blog) are required' });
      return;
    }
    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      type,
      description: description?.trim(),
      icon: icon != null && String(icon).trim() ? String(icon).trim() : undefined,
      parent: parent || undefined,
      order: order != null ? Number(order) : undefined,
      status: status === 'draft' || status === 'published' ? status : 'published',
      seo: seo && typeof seo === 'object' ? seo : undefined,
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, slug, description, icon, parent, order, status, seo } = req.body;
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name.trim();
    if (slug !== undefined) update.slug = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (description !== undefined) update.description = description?.trim() || null;
    if (icon !== undefined) update.icon = icon != null && String(icon).trim() ? String(icon).trim() : null;
    if (parent !== undefined) update.parent = parent || null;
    if (order !== undefined) update.order = Number(order);
    if (status === 'draft' || status === 'published') update.status = status;
    if (seo !== undefined) update.seo = seo && typeof seo === 'object' ? seo : undefined;
    const category = await Category.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
