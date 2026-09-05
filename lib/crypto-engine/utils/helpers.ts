export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output: any = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const srcVal = source[key];
      const tgtVal = output[key];
      if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
        output[key] = deepMerge(tgtVal, srcVal);
      } else if (srcVal !== undefined) {
        output[key] = srcVal;
      }
    }
  }
  return output;
}

function isPlainObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Format currency (USD) */
export function formatCurrency(value: number, maxDecimals: number = 2): string {
  if (value === 0) return '$0.00';
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e4) return `$${value.toFixed(0)}`;
  return `$${value.toFixed(maxDecimals)}`;
}

/** Truncate a string to a max length with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/** Generate a unique ID (nanoid alternative) */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/** Ensure a value is within a range (clamp) */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}