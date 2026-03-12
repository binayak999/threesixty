/**
 * In-memory cache for auth session so the header/navbar doesn't re-fetch on every
 * route change. Once loaded, session is persisted until sign-out or page reload.
 */

export interface CachedSession {
  isLoggedIn: boolean;
  userRole: string | null;
}

let cache: CachedSession | null = null;

export function getSessionCache(): CachedSession | null {
  return cache;
}

export function setSessionCache(session: CachedSession): void {
  cache = session;
}

export function clearSessionCache(): void {
  cache = { isLoggedIn: false, userRole: null };
}
