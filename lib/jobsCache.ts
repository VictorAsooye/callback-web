// Browser-side stale-while-revalidate job cache using localStorage.
// No expiry — stale data is infinitely better than a blank screen.

function key(userId: string, role: string): string {
  return `@callback/jobs_v3/${userId}/${role.toLowerCase().trim()}`;
}

export function loadJobCache<T>(userId: string, role: string): T[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key(userId, role));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { jobs: T[] };
    return Array.isArray(parsed.jobs) && parsed.jobs.length > 0 ? parsed.jobs : null;
  } catch {
    return null;
  }
}

export function saveJobCache<T>(userId: string, role: string, jobs: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key(userId, role), JSON.stringify({ jobs, savedAt: Date.now() }));
  } catch {
    // non-fatal — cache miss on next open is fine
  }
}

export function clearJobCache(userId: string, role: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key(userId, role));
  } catch {
    // non-fatal
  }
}
