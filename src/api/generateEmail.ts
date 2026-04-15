import type { Talent } from '../types';

interface GenerateEmailOptions {
  talent: Talent;
  apiKey: string;
  context?: string;
}

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeContentBlock[];
  error?: { message: string };
}

function buildPrompt(talent: Talent, context?: string): string {
  const contextLine = context?.trim()
    ? `The brand/campaign context is: "${context.trim()}".`
    : `No specific campaign brief — pitch a general brand collaboration opportunity.`;

  return `You are a talent casting director writing a cold outreach email to a content creator. ${contextLine}

Creator details:
- Name: ${talent.name} (${talent.handle})
- Platform: ${talent.platform}
- Niche: ${talent.niche}
- Followers: ${talent.followers.toLocaleString()}
- Engagement rate: ${talent.engagement}%
- Audience: ${talent.audienceDemographic}
- Past brand collaborations: ${talent.pastBrands.join(', ')}
- Bio: ${talent.bio}
- Ad performance: ${talent.adPerformance.views} views, ${talent.adPerformance.ctr} CTR

Write a personalized, warm, 4-6 sentence pitch email to ${talent.name}. Address them by first name. Reference something specific about their niche, audience, or past brand work — do not be generic. Propose a specific collaboration angle that aligns with their content style. End with a clear, low-friction CTA.

Return ONLY the email body as plain text (no subject line, no preamble, no markdown).`;
}

export async function generateEmail({ talent, apiKey, context }: GenerateEmailOptions): Promise<string> {
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
      max_tokens: 600,
      messages: [{ role: 'user', content: buildPrompt(talent, context) }],
    }),
  });

  const data = (await res.json()) as ClaudeResponse;
  if (data.error) throw new Error(data.error.message);
  return (data.content ?? []).map(c => c.text ?? '').join('').trim();
}
