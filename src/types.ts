export interface AdPerformance {
  views: string;
  ctr: string;
  completionRate: string;
}

export interface Talent {
  id: number;
  name: string;
  handle: string;
  platform: string;
  niche: string;
  gender: string;
  followers: number;
  engagement: number;
  age: string;
  location: string;
  pastBrands: string[];
  audienceDemographic: string;
  adPerformance: AdPerformance;
  bio: string;
}

export interface Ranking {
  id: number;
  score: number;
  reason: string;
}

export type RankingMap = Record<number, Ranking>;

export interface Filters {
  platform: string;
  niche: string;
  gender: string;
  followers: string;
}

export type FollowerTier = 'nano' | 'micro' | 'mid' | 'macro';
