import type { Filters, Talent } from '../types';
import { followerTier } from './followers';

export const EMPTY_FILTERS: Filters = {
  platform: '',
  niche: '',
  gender: '',
  followers: '',
};

export function applyFilters(pool: Talent[], filters: Filters): Talent[] {
  return pool.filter(t => {
    if (filters.platform && t.platform !== filters.platform) return false;
    if (filters.niche && t.niche !== filters.niche) return false;
    if (filters.gender && t.gender !== filters.gender) return false;
    if (filters.followers && followerTier(t.followers) !== filters.followers) return false;
    return true;
  });
}
