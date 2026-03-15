import { Router, Request, Response } from 'express';
import User from '../models/User';
import Listing from '../models/Listing';
import Blog from '../models/Blog';
import Video from '../models/Video';
import '../models/Tier';

const router = Router();

/** Shared handler: get tier limits and counts for a user (used by GET /api/users/:id/limits and GET /api/profile/limits). */
export async function handleUserLimits(userId: string, res: Response): Promise<void> {
  const user = await User.findById(userId).populate('tier').lean();
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  const isAdmin = user.role === 'admin' || (user as { role?: string }).role === 'superadmin';
  const tier = isAdmin ? null : (user.tier as { name?: string; maxListings?: number; maxBlogs?: number; maxVideos?: number } | null);
  const [listingCount, blogCount, videoCount] = await Promise.all([
    Listing.countDocuments({ user: user._id, status: { $in: ['pending', 'published'] } }),
    Blog.countDocuments({ user: user._id, status: { $in: ['pending', 'published'] } }),
    Video.countDocuments({ user: user._id, status: { $in: ['pending', 'published'] } }),
  ]);
  res.json({
    success: true,
    data: {
      tier: tier
        ? {
            name: tier.name,
            maxListings: tier.maxListings ?? 0,
            maxBlogs: tier.maxBlogs ?? 0,
            maxVideos: tier.maxVideos ?? 0,
          }
        : null,
      listingCount,
      blogCount,
      videoCount,
    },
  });
}

/** GET /api/users/:id/limits - Returns tier limits and current counts for profile (call with session user id) */
router.get('/:id/limits', async (req: Request, res: Response) => {
  try {
    await handleUserLimits(req.params.id, res);
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
