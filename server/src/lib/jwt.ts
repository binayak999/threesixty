import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  iat?: number;
  exp?: number;
};

export function signSession(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(
    {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifySession(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded?.sub || !decoded?.email || !decoded?.role) return null;
    if (!['user', 'admin', 'superadmin'].includes(decoded.role)) return null;
    return {
      sub: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
