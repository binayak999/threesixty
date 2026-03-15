import { Router, Request, Response } from 'express';
import { getSessionFromCookie } from '../lib/session';
import { handleUserLimits } from './users';

const router = Router();

/** GET /api/profile/limits - Same as GET /api/users/:id/limits but uses session (so client can call /api/profile/limits when hitting backend directly). */
router.get('/limits', async (req: Request, res: Response) => {
  const user = getSessionFromCookie(req.headers.cookie);
  if (!user?.id) {
    res.status(401).json({ message: 'Unauthorized.' });
    return;
  }
  try {
    await handleUserLimits(user.id, res);
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message });
  }
});

export default router;
