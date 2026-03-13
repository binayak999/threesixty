import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { signSession, verifySession } from '../lib/jwt';

const router = Router();

const ROLES = ['user', 'admin', 'superadmin'] as const;
type UserRole = (typeof ROLES)[number];

const SESSION_COOKIE_NAME = 'auth_session';
const SESSION_MAX_AGE_DAYS = 7;

function setSessionCookie(res: Response, token: string): void {
  const maxAge = 60 * 60 * 24 * SESSION_MAX_AGE_DAYS;
  const secure = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
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
  const token = match?.[1]?.trim();
  if (!token) return null;
  const payload = verifySession(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    role: payload.role as UserRole,
  };
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
    const token = signSession({
      sub: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      role: sessionUser.role,
    });
    setSessionCookie(res, token);
    const redirectTo = ROLES.indexOf(sessionUser.role) >= ROLES.indexOf('admin') ? '/dashboard' : '/';
    res.status(200).json({
      user: sessionUser,
      token,
      redirectTo,
    });
  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

export default router;
