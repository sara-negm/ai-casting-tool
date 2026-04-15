import type { Talent } from '../types';

export function searchTalent(pool: Talent[], query: string): Talent[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...pool];

  return pool.filter(t => {
    const haystack = [
      t.name,
      t.handle,
      t.platform,
      t.niche,
      t.gender,
      t.bio,
      t.audienceDemographic,
      t.pastBrands.join(' '),
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
