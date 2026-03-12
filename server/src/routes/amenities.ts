import { Router, Request, Response } from 'express';
import Amenity from '../models/Amenity';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const amenities = await Amenity.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: amenities });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const amenity = await Amenity.findById(req.params.id).lean();
    if (!amenity) {
      res.status(404).json({ success: false, message: 'Amenity not found' });
      return;
    }
    res.json({ success: true, data: amenity });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, icon, slug } = req.body;
    if (!name || !slug) {
      res.status(400).json({ success: false, message: 'name and slug are required' });
      return;
    }
    const slugNorm = String(slug).trim().toLowerCase().replace(/\s+/g, '-');
    const amenity = await Amenity.create({
      name: String(name).trim(),
      icon: icon != null ? String(icon).trim() : '',
      slug: slugNorm,
    });
    res.status(201).json({ success: true, data: amenity });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, icon, slug } = req.body;
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = String(name).trim();
    if (icon !== undefined) update.icon = String(icon).trim();
    if (slug !== undefined) update.slug = String(slug).trim().toLowerCase().replace(/\s+/g, '-');
    const amenity = await Amenity.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!amenity) {
      res.status(404).json({ success: false, message: 'Amenity not found' });
      return;
    }
    res.json({ success: true, data: amenity });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const amenity = await Amenity.findByIdAndDelete(req.params.id);
    if (!amenity) {
      res.status(404).json({ success: false, message: 'Amenity not found' });
      return;
    }
    res.json({ success: true, message: 'Amenity deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
