import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

const router = Router();

const ROLES = ['user', 'admin', 'superadmin'] as const;
type UserRole = (typeof ROLES)[number];

const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_MAX_AGE_DAYS = 7;

function sessionCookieValue(payload: { id: string; email: string; name: string; role: UserRole }): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
}

function setSessionCookie(res: Response, payload: { id: string; email: string; name: string; role: UserRole }): void {
  const value = sessionCookieValue(payload);
  const maxAge = 60 * 60 * 24 * SESSION_MAX_AGE_DAYS;
  const secure = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function getSessionFromCookie(cookieHeader: string | undefined): { id: string; email: string; name: string; role: UserRole } | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`\\b${SESSION_COOKIE_NAME}=([^;]+)`));
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

/** POST /api/auth/sign-out – clear auth_session cookie so session is dropped. */
router.post('/sign-out', (_req: Request, res: Response): void => {
  const secure = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
  res.status(200).json({ ok: true });
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

    const sessionUser = {
      id: String(user._id),
      email: user.email ?? '',
      name: user.name ?? user.email ?? '',
      role: user.role as UserRole,
    };
    setSessionCookie(res, sessionUser);
    res.status(200).json({
      user: sessionUser,
    });
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

export default router;
