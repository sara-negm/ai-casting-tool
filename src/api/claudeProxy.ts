export interface ClaudeContentBlock {
  type: string;
  text?: string;
}

export interface ClaudeResponse {
  content?: ClaudeContentBlock[];
  error?: { message: string };
}

export async function callClaude(body: unknown): Promise<ClaudeResponse> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as ClaudeResponse;
  if (data.error) throw new Error(data.error.message);
  return data;
}
