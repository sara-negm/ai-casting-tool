import type { Talent } from '../types';

function stripAt(handle: string): string {
  return handle.startsWith('@') ? handle.slice(1) : handle;
}

export function profileUrl(talent: Talent): string {
  const handle = stripAt(talent.handle);
  switch (talent.platform) {
    case 'TikTok':
      return `https://www.tiktok.com/@${handle}`;
    case 'Instagram':
      return `https://www.instagram.com/${handle}/`;
    case 'YouTube':
      return `https://www.youtube.com/@${handle}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(`${talent.name} ${talent.handle} ${talent.platform}`)}`;
  }
}

export function researchUrl(talent: Talent): string {
  const handle = stripAt(talent.handle);
  const q = `"${talent.name}" ${handle} ${talent.platform} ${talent.niche}`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}
