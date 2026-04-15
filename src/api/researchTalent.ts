import type { Talent } from '../types';
import { callClaude } from './claudeProxy';

interface ResearchTalentOptions {
  talent: Talent;
}

function buildPrompt(talent: Talent): string {
  return `Research the content creator ${talent.name} (${talent.handle}) on ${talent.platform}. They focus on ${talent.niche} content and have around ${talent.followers.toLocaleString()} followers.

Use web search to find current information about:
- Recent brand partnerships and sponsored content (include dates if possible)
- Recent viral posts, campaigns, or notable content moments
- Audience sentiment — are comments on their sponsored posts positive, skeptical, or mixed?
- Any brand controversies, red flags, or reputation issues
- Engagement and growth trends (is their audience growing, stable, or declining?)

Return a concise research brief as 4-6 short bullet points. Be specific and factual — cite dates and numbers when you find them. If the web search does not return information about a particular question, explicitly say "no public information found" for that bullet rather than speculating. Do not include a preamble or closing — just the bullets. Start each bullet with "• ".`;
}

export async function researchTalent({ talent }: ResearchTalentOptions): Promise<string> {
  const data = await callClaude({
    model: 'claude-sonnet-4-5',
    max_tokens: 1500,
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
    messages: [{ role: 'user', content: buildPrompt(talent) }],
  });

  const text = (data.content ?? [])
    .filter(b => b.type === 'text')
    .map(b => b.text ?? '')
    .join('\n\n')
    .trim();

  if (!text) throw new Error('No research summary returned.');
  return text;
}
