/** Get current UTC timestamp in ISO format */
export function nowUtc(): string {
  return new Date().toISOString();
}

/** Get current UTC Date object */
export function nowUtcDate(): Date {
  return new Date();
}

/** Convert a string/timestamp to UTC Date */
export function toUtcDate(date: string | number | Date): Date {
  const d = new Date(date);
  return new Date(d.toUTCString());
}

/** Format a date for display (e.g., "Jan 15, 2024") */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Check if a date is older than X seconds */
export function isStale(date: Date | string, maxAgeSeconds: number): boolean {
  const d = new Date(date);
  const age = (Date.now() - d.getTime()) / 1000;
  return age > maxAgeSeconds;
}

/** Get the difference in days between two dates */
export function daysBetween(a: Date | string, b: Date | string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  const diff = d2.getTime() - d1.getTime();
  return diff / (1000 * 60 * 60 * 24);
}

/** Get start of day (UTC) for a given date */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}