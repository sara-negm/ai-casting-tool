import { useState } from 'react';
import type { Ranking, Talent } from '../types';
import { followerLabel } from '../utils/followers';
import { generateEmail } from '../api/generateEmail';

interface Props {
  talent: Talent;
  ranking?: Ranking;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  apiKey: string;
  context: string;
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('');
}

export default function TalentCard({ talent, ranking, selected, onToggleSelect, apiKey, context }: Props) {
  const [emailText, setEmailText] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [copied, setCopied] = useState(false);

  const isTop = !!ranking && ranking.score >= 85;
  const isGood = !!ranking && ranking.score >= 70 && ranking.score < 85;
  const classes = [
    'card',
    isTop && 'top-pick',
    (isTop || isGood) && 'has-badge',
    selected && 'selected',
  ].filter(Boolean).join(' ');

  async function handleGenerate() {
    if (!apiKey.trim()) {
      setEmailError('Enter your Anthropic API key above to generate emails.');
      return;
    }
    setEmailError('');
    setEmailLoading(true);
    setEmailText('');
    try {
      const text = await generateEmail({ talent, apiKey: apiKey.trim(), context });
      setEmailText(text);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : String(err));
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; fail silently
    }
  }

  function handleDismiss() {
    setEmailText('');
    setEmailError('');
  }

  return (
    <div className={classes}>
      {isTop && <div className="badge badge-ai">AI PICK</div>}
      {isGood && <div className="badge badge-good">STRONG MATCH</div>}

      <label className="select-check" aria-label={`Select ${talent.name}`}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(talent.id)}
        />
      </label>

      <div className="card-header">
        <div className="avatar">{initials(talent.name)}</div>
        <div className="card-identity">
          <p className="name">{talent.name}</p>
          <p className="handle">{talent.handle}</p>
        </div>
      </div>

      <div className="tags">
        <span className="tag">{talent.platform}</span>
        <span className="tag">{talent.niche}</span>
        <span className="tag">{talent.gender}</span>
      </div>

      <div className="stats">
        <div>
          <p className="stat-val">{followerLabel(talent.followers)}</p>
          <p className="stat-label">Followers</p>
        </div>
        <div className="stat-divider">
          <p className="stat-val">{talent.engagement}%</p>
          <p className="stat-label">Eng. rate</p>
        </div>
        <div>
          <p className="stat-val">{talent.adPerformance.ctr}</p>
          <p className="stat-label">Ad CTR</p>
        </div>
      </div>

      <div className="meta">
        <p>Past brands: {talent.pastBrands.join(', ')}</p>
        <p>{talent.audienceDemographic}</p>
      </div>

      <div className="card-actions">
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={emailLoading}
        >
          {emailLoading ? 'Writing…' : '✨ Generate outreach email'}
        </button>
      </div>

      {ranking && (
        <div className={`ai-reason${isTop ? ' top' : ''}`}>
          <p className="ai-reason-label">AI reason · {ranking.score}/100</p>
          <p className="ai-reason-text">{ranking.reason}</p>
        </div>
      )}

      {emailError && (
        <div className="generated-email error">
          <p>{emailError}</p>
        </div>
      )}

      {emailText && (
        <div className="generated-email">
          <div className="generated-email-header">
            <p className="generated-email-label">Outreach draft for {talent.name}</p>
            <div className="generated-email-actions">
              <button className="email-copy" onClick={handleCopy}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
              <button className="email-dismiss" onClick={handleDismiss} aria-label="Dismiss">×</button>
            </div>
          </div>
          <pre className="generated-email-text">{emailText}</pre>
        </div>
      )}
    </div>
  );
}
