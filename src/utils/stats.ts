import type { Talent } from '../types';

export interface BenchmarkRow {
  engagement: number;
  ctr: number;
  count: number;
}

export interface Benchmarks {
  overall: BenchmarkRow;
  byNiche: Record<string, BenchmarkRow>;
  byPlatform: Record<string, BenchmarkRow>;
}

function parsePercent(s: string): number {
  return parseFloat(s.replace('%', '')) || 0;
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function rowFor(talent: Talent[]): BenchmarkRow {
  return {
    engagement: mean(talent.map(t => t.engagement)),
    ctr: mean(talent.map(t => parsePercent(t.adPerformance.ctr))),
    count: talent.length,
  };
}

export function computeBenchmarks(talent: Talent[]): Benchmarks {
  const byNiche: Record<string, BenchmarkRow> = {};
  const byPlatform: Record<string, BenchmarkRow> = {};

  const groupsByNiche: Record<string, Talent[]> = {};
  const groupsByPlatform: Record<string, Talent[]> = {};
  for (const t of talent) {
    (groupsByNiche[t.niche] ||= []).push(t);
    (groupsByPlatform[t.platform] ||= []).push(t);
  }

  for (const [niche, ts] of Object.entries(groupsByNiche)) byNiche[niche] = rowFor(ts);
  for (const [platform, ts] of Object.entries(groupsByPlatform)) byPlatform[platform] = rowFor(ts);

  return {
    overall: rowFor(talent),
    byNiche,
    byPlatform,
  };
}

export function percentDelta(value: number, baseline: number): number {
  if (baseline === 0) return 0;
  return Math.round(((value - baseline) / baseline) * 100);
}

export function formatBenchmarksForPrompt(b: Benchmarks): string {
  const lines: string[] = [];
  lines.push(`Dataset benchmarks (for grounding the reasons in concrete numbers):`);
  lines.push(`- Overall avg engagement rate: ${b.overall.engagement.toFixed(1)}%`);
  lines.push(`- Overall avg ad CTR: ${b.overall.ctr.toFixed(1)}%`);
  lines.push(`- By niche:`);
  for (const [niche, row] of Object.entries(b.byNiche)) {
    lines.push(`    ${niche}: ${row.engagement.toFixed(1)}% engagement, ${row.ctr.toFixed(1)}% CTR (${row.count} creators)`);
  }
  lines.push(`- By platform:`);
  for (const [platform, row] of Object.entries(b.byPlatform)) {
    lines.push(`    ${platform}: ${row.engagement.toFixed(1)}% engagement, ${row.ctr.toFixed(1)}% CTR (${row.count} creators)`);
  }
  return lines.join('\n');
}
