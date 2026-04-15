import type { FollowerTier, Talent } from '../types';
import { followerTier } from '../utils/followers';
import { getApiKey } from './apiKey';

export interface ExtractedFilters {
  platform: string | null;
  niche: string | null;
  gender: string | null;
  followerTier: FollowerTier | null;
  minFollowers: number | null;
  maxFollowers: number | null;
  performance: 'high' | 'any';
}

export interface ExtractedBrief {
  filters: ExtractedFilters;
  interpretation: string;
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeContentBlock[];
  error?: { message: string };
}

function buildPrompt(query: string): string {
  return `You are a casting director assistant. Parse this brief and extract structured search criteria.

Brief: "${query}"

Return ONLY valid JSON with this exact shape — no preamble, no markdown, no explanation:

{
  "filters": {
    "platform": "TikTok" | "Instagram" | "YouTube" | null,
    "niche": "Fitness" | "Skincare" | "Food & Beverage" | "Lifestyle" | "Wellness" | null,
    "gender": "Female" | "Male" | "Non-binary" | null,
    "followerTier": "nano" | "micro" | "mid" | "macro" | null,
    "minFollowers": number | null,
    "maxFollowers": number | null,
    "performance": "high" | "any"
  },
  "interpretation": "One short sentence paraphrasing what you understood from the brief."
}

Rules:
- Follower tiers: nano <50k, micro 50k-250k, mid 250k-1M, macro 1M+.
- If the brief mentions an explicit number ("under 500k", "at least 1M"), set minFollowers/maxFollowers and leave followerTier null.
- If the brief uses a tier word, set followerTier and leave min/max null.
- Set performance = "high" if the brief asks for high-performing / strong / top creators. Otherwise "any".
- Use null for any criterion not explicitly or implicitly present.
- Only choose from the exact niche values above — map anything close ("supplements" → "Fitness", "beauty" → "Skincare", "food" → "Food & Beverage", "mindfulness" → "Wellness", "general" → "Lifestyle").`;
}

export async function extractBriefFilters({ query }: { query: string }): Promise<ExtractedBrief> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: buildPrompt(query) }],
    }),
  });

  const data = (await res.json()) as ClaudeResponse;
  if (data.error) throw new Error(data.error.message);

  const raw = (data.content ?? []).map(b => b.text ?? '').join('').trim();
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) as ExtractedBrief;
  return parsed;
}

export function applyExtractedFilters(talent: Talent[], f: ExtractedFilters): Talent[] {
  return talent.filter(t => {
    if (f.platform && t.platform !== f.platform) return false;
    if (f.niche && t.niche !== f.niche) return false;
    if (f.gender && t.gender !== f.gender) return false;
    if (f.followerTier && followerTier(t.followers) !== f.followerTier) return false;
    if (f.minFollowers != null && t.followers < f.minFollowers) return false;
    if (f.maxFollowers != null && t.followers > f.maxFollowers) return false;
    return true;
  });
}

export function summarizeFilters(f: ExtractedFilters): string {
  const parts: string[] = [];
  if (f.gender) parts.push(f.gender);
  if (f.niche) parts.push(f.niche);
  if (f.platform) parts.push(f.platform);
  if (f.followerTier) {
    const labels: Record<FollowerTier, string> = {
      nano: '<50k',
      micro: '50k–250k',
      mid: '250k–1M',
      macro: '1M+',
    };
    parts.push(labels[f.followerTier]);
  }
  if (f.minFollowers != null || f.maxFollowers != null) {
    const formatFollowers = (n: number) =>
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}k`;
    if (f.minFollowers != null && f.maxFollowers != null) {
      parts.push(`${formatFollowers(f.minFollowers)}–${formatFollowers(f.maxFollowers)}`);
    } else if (f.maxFollowers != null) {
      parts.push(`under ${formatFollowers(f.maxFollowers)}`);
    } else if (f.minFollowers != null) {
      parts.push(`${formatFollowers(f.minFollowers)}+`);
    }
  }
  if (f.performance === 'high') parts.push('high-performing');
  return parts.length > 0 ? parts.join(' · ') : '(no constraints extracted)';
}
