/** Normalize trial coupon input for lookup (matches admin storage). */
export function normalizeTrialCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
