import { Router, Request, Response } from 'express';
import Review from '../models/Review';
import Media from '../models/Media';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const listingId = req.query.listingId as string | undefined;
    const filter: Record<string, unknown> = {};
    if (listingId) {
      filter.listing = listingId;
      filter.isApproved = true;
    }
    const reviews = await Review.find(filter)
      .populate('listing', 'title slug')
      .populate('user', 'name email')
      .populate({ path: 'reviewMedias', select: 'url urlMedium urlLow type' })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { listing: listingId, user: userId, rating, comment, reviewMedias } = req.body;
    if (!listingId || !userId || rating == null || !comment || typeof comment !== 'string') {
      res.status(400).json({
        success: false,
        message: 'listing, user, rating (1-5), and comment are required.',
      });
      return;
    }
    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5 || !Number.isFinite(numRating)) {
      res.status(400).json({ success: false, message: 'rating must be between 1 and 5.' });
      return;
    }
    const mediaIds = Array.isArray(reviewMedias)
      ? reviewMedias.filter((id: unknown) => id && typeof id === 'string')
      : [];
    if (mediaIds.length > 0) {
      const mediaDocs = await Media.find({ _id: { $in: mediaIds } }).select('user').lean();
      const notOwned = mediaDocs.filter(
        (m) => m.user == null || String(m.user) !== String(userId)
      );
      if (notOwned.length > 0) {
        res.status(400).json({
          success: false,
          message: 'You can only attach your own media to a review.',
        });
        return;
      }
    }
    const review = await Review.create({
      listing: listingId,
      user: userId,
      rating: numRating,
      comment: comment.trim(),
      helpfulCount: 0,
      isApproved: false,
      reviewMedias: mediaIds,
    });
    const populated = await Review.findById(review._id)
      .populate('listing', 'title slug')
      .populate('user', 'name email')
      .populate({ path: 'reviewMedias', select: 'url urlMedium urlLow type' })
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('listing', 'title slug')
      .populate('user', 'name email')
      .populate('parent')
      .populate({ path: 'reviewMedias', select: 'url urlMedium urlLow type' })
      .lean();
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      res.status(400).json({ success: false, message: 'isApproved (boolean) required' });
      return;
    }
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    )
      .populate('listing', 'title slug')
      .populate('user', 'name email')
      .lean();
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
