import type { Ranking, Talent } from '../types';
import { followerLabel } from '../utils/followers';
import type { Benchmarks } from '../utils/stats';
import { formatBenchmarksForPrompt } from '../utils/stats';
import { getApiKey } from './apiKey';

interface RankTalentOptions {
  query: string;
  talent: Talent[];
  benchmarks?: Benchmarks;
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeContentBlock[];
  error?: { message: string };
}

function buildPrompt(query: string, talent: Talent[], benchmarks?: Benchmarks): string {
  const talentList = talent.map(t =>
    `ID:${t.id} | ${t.name} | ${t.platform} | ${t.niche} | ${t.gender} | ${followerLabel(t.followers)} followers | ${t.engagement}% engagement | CTR:${t.adPerformance.ctr} | Completion:${t.adPerformance.completionRate} | Past brands: ${t.pastBrands.join(', ')} | Audience: ${t.audienceDemographic} | ${t.bio}`
  ).join('\n');

  const benchmarksBlock = benchmarks ? `\n\n${formatBenchmarksForPrompt(benchmarks)}\n` : '';

  return `You are an expert talent casting director at a performance creative agency. Score and rank these pre-filtered creators for this brief: "${query}"${benchmarksBlock}

Creators to rank:
${talentList}

Rank all creators from best to worst, then for each creator return:
- score: 0-100 (be discriminating — only 2-3 of ${talent.length} should score 85+)
- highlights: an array of 2-4 SHORT bullets (max ~12 words each). Each bullet MUST cite a concrete number or fact. No vague language like "strong fit" or "good alignment".
  Good examples: "CTR +27% vs Skincare avg (5.6% vs 4.4%)", "Engagement 7.9% beats niche avg of 5.9%", "Past Tatcha/CeraVe work signals brand-safety".
- comparative: ONE REQUIRED short sentence (max ~20 words) that positions this creator AGAINST their peers in the result set. This is not about the creator alone — it's about how they stack up.
  * For the #1 creator: cite the SPECIFIC metric where they lead everyone else. Example: "Ranked #1 due to highest CTR (5.6%) and engagement vs all peers in this result set".
  * For #2, #3, etc.: cite what they give up vs the creators ABOVE them. Example: "Lower than #1 due to weaker CTR (4.2% vs 5.6%) despite comparable audience match".
  * For low scorers: cite what top picks have that they don't. Example: "Weaker overall — smaller 93k audience and wellness niche off-brief vs top picks at 200k+ in-niche".
  Use comparative language ("lower than", "highest", "vs top picks", "vs peers") — never describe the creator in isolation.

Return ONLY valid JSON, no markdown, no preamble. Order the array by score descending:

{"rankings":[
  {"id":1,"score":92,"highlights":["CTR +27% vs Skincare avg (5.6% vs 4.4%)","Engagement 7.9% beats niche avg of 5.9%","Past Tatcha/CeraVe partnerships signal brand-safety"],"comparative":"Ranked #1 due to highest engagement (7.9%) and strongest premium-skincare brand history in the set"},
  {"id":3,"score":78,"highlights":["CTR 4.4% edges Skincare avg (4.4%)","Bilingual reach extends audience"],"comparative":"Lower than #1 due to weaker engagement (3.8% vs 7.9%) despite similar audience fit"},
  {"id":5,"score":58,"highlights":["TikTok reach aligns with mobile-first briefs","High engagement at 9.2%"],"comparative":"Weaker overall — smaller 93k audience vs top picks at 200k+ and wellness niche off-brief"}
]}

Every highlight must reference real numbers from the data. Every comparative must reference at least one specific number or peer.`;
}

export async function rankTalent({ query, talent, benchmarks }: RankTalentOptions): Promise<Ranking[]> {
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
      max_tokens: 1500,
      messages: [{ role: 'user', content: buildPrompt(query, talent, benchmarks) }],
    }),
  });

  const data = (await res.json()) as ClaudeResponse;
  if (data.error) throw new Error(data.error.message);

  const raw = (data.content ?? []).map(i => i.text ?? '').join('');
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) as { rankings: Ranking[] };
  return parsed.rankings;
}
