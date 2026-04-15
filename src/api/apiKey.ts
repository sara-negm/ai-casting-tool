export function getApiKey(): string {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key || !key.trim()) {
    throw new Error(
      'VITE_ANTHROPIC_API_KEY is not set. Create a .env.local file in the project root with VITE_ANTHROPIC_API_KEY=sk-ant-... and restart the dev server.'
    );
  }
  return key.trim();
}
