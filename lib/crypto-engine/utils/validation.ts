// utils/validation.ts

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function hasKeys(obj: unknown, keys: string[]): boolean {
  if (!isObject(obj)) return false;
  return keys.every((key) => key in obj);
}

export function isValidTimestamp(value: unknown): boolean {
  if (typeof value !== 'number') return false;
  return value > 0 && value < 8640000000000; // Valid JS timestamp range
}

/** Basic ETH/BSC address validation (checksum optional) */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}