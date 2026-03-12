import { Router, Request, Response } from 'express';
import MenuItem from '../models/MenuItem';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const listingId = req.query.listingId as string | undefined;
    const filter = listingId ? { listing: listingId } : {};
    const items = await MenuItem.find(filter)
      .populate('listing', 'title slug')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate('listing', 'title slug')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { listing, title, detail, price, label } = req.body;
    if (!listing || !title || price == null) {
      res.status(400).json({ success: false, message: 'listing, title and price are required' });
      return;
    }
    const item = await MenuItem.create({
      listing,
      title: String(title).trim(),
      detail: detail != null ? String(detail).trim() : undefined,
      price: Number(price),
      label: label != null ? String(label).trim() : undefined,
    });
    const populated = await MenuItem.findById(item._id).populate('listing', 'title slug').lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { listing, title, detail, price, label } = req.body;
    const update: Record<string, unknown> = {};
    if (listing !== undefined) update.listing = listing;
    if (title !== undefined) update.title = String(title).trim();
    if (detail !== undefined) update.detail = detail != null ? String(detail).trim() : null;
    if (price !== undefined) update.price = Number(price);
    if (label !== undefined) update.label = label != null ? String(label).trim() : null;
    const item = await MenuItem.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('listing', 'title slug')
      .lean();
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Menu item not found' });
      return;
    }
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
