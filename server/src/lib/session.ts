import { verifySession } from './jwt';

const SESSION_COOKIE_NAME = 'auth_session';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
};

/**
 * Read session user from Cookie header (auth_session cookie).
 * Uses same JWT verification as auth routes so media/list work when /api is proxied to backend.
 */
export function getSessionFromCookie(cookieHeader: string | undefined): SessionUser | null {
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
    role: payload.role,
  };
}
