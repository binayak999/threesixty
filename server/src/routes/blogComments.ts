import { Router, Request, Response } from 'express';
import BlogComment from '../models/BlogComment';

const router = Router();

/** List comments: ?blogId=xxx (required for public), &approvedOnly=1 (default for public) */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { blogId, approvedOnly } = req.query;
    const filter: Record<string, unknown> = {};
    if (blogId && typeof blogId === 'string') {
      filter.blog = blogId;
    }
    if (approvedOnly === '1' || approvedOnly === 'true') {
      filter.isApproved = true;
    }
    const comments = await BlogComment.find(filter)
      .populate('user', 'name email')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { blog: blogId, user: userId, authorName, authorEmail, content, parent } = req.body;
    if (!blogId || !authorName || !authorEmail || !content) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: blog, authorName, authorEmail, content.',
      });
      return;
    }
    const comment = await BlogComment.create({
      blog: blogId,
      user: userId || undefined,
      authorName: String(authorName).trim(),
      authorEmail: String(authorEmail).trim(),
      content: String(content).trim(),
      parent: parent || undefined,
      isApproved: false,
    });
    const populated = await BlogComment.findById(comment._id)
      .populate('user', 'name email')
      .lean();
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: (err as Error).message });
  }
});

/** Approve or reject comment (admin) */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      res.status(400).json({ success: false, message: 'isApproved (boolean) required' });
      return;
    }
    const comment = await BlogComment.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('blog', 'title slug')
      .lean();
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }
    res.json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const comment = await BlogComment.findByIdAndDelete(req.params.id);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found' });
      return;
    }
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
