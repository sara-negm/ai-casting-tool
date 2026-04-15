import type { FollowerTier } from '../types';

export function followerLabel(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return Math.round(n / 1000) + 'k';
  return String(n);
}

export function followerTier(n: number): FollowerTier {
  if (n < 50_000) return 'nano';
  if (n < 250_000) return 'micro';
  if (n < 1_000_000) return 'mid';
  return 'macro';
}
