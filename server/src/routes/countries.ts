import { Router, Request, Response } from 'express';
import Country from '../models/Country';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const countries = await Country.find({ isActive: true })
      .sort({ name: 1 })
      .select('_id code name slug')
      .lean();
    res.json({ success: true, data: countries });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
