import type { Ranking, Talent } from '../types';
import { followerLabel } from '../utils/followers';

interface RankTalentOptions {
  query: string;
  apiKey: string;
  talent: Talent[];
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeContentBlock[];
  error?: { message: string };
}

function buildPrompt(query: string, talent: Talent[]): string {
  const talentList = talent.map(t =>
    `ID:${t.id} | ${t.name} | ${t.platform} | ${t.niche} | ${t.gender} | ${followerLabel(t.followers)} followers | ${t.engagement}% engagement | CTR:${t.adPerformance.ctr} | Completion:${t.adPerformance.completionRate} | Past brands: ${t.pastBrands.join(', ')} | Audience: ${t.audienceDemographic} | ${t.bio}`
  ).join('\n');

  return `You are an expert talent casting director at a performance creative agency. Score and rank these creators for this brief: "${query}"

Talent database:
${talentList}

Return ONLY valid JSON — no markdown, no preamble. Score each talent 0-100 for fit. Include a short 1-sentence reason for each.

{"rankings":[{"id":1,"score":92,"reason":"Strong fit because..."},{"id":2,"score":45,"reason":"..."}]}

Score all ${talent.length} talents. Be discriminating — only 2-3 should score above 85.`;
}

export async function rankTalent({ query, apiKey, talent }: RankTalentOptions): Promise<Ranking[]> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: buildPrompt(query, talent) }],
    }),
  });

  const data = (await res.json()) as ClaudeResponse;
  if (data.error) throw new Error(data.error.message);

  const raw = (data.content ?? []).map(i => i.text ?? '').join('');
  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) as { rankings: Ranking[] };
  return parsed.rankings;
}
