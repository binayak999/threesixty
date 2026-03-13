import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

const router = Router();

const ROLES = ['user', 'admin', 'superadmin'] as const;
type UserRole = (typeof ROLES)[number];

function getSessionFromCookie(cookieHeader: string | undefined): { id: string; email: string; name: string; role: UserRole } | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/\bauth_session=([^;]+)/);
  const value = match?.[1]?.trim();
  if (!value) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8')
    ) as { id?: string; email?: string; name?: string; role?: string };
    if (!payload?.email || !payload?.role) return null;
    const role = payload.role as UserRole;
    if (!ROLES.includes(role)) return null;
    return {
      id: payload.id ?? '',
      email: payload.email,
      name: payload.name ?? payload.email,
      role,
    };
  } catch {
    return null;
  }
}

/** GET /api/auth/session – return current user from auth_session cookie (same contract as Next.js API route). */
router.get('/session', (_req: Request, res: Response): void => {
  try {
    const user = getSessionFromCookie(_req.headers.cookie);
    res.json({ user: user ?? null });
  } catch {
    res.json({ user: null });
  }
});

router.post('/sign-in', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() })
      .select('+passwordHash')
      .lean();

    if (!user || !user.passwordHash) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const match = await bcrypt.compare(String(password), user.passwordHash);
    if (!match) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    res.status(200).json({
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

export default router;
