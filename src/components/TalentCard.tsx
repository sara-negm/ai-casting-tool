import { useState } from 'react';
import type { Ranking, Talent } from '../types';
import { followerLabel } from '../utils/followers';
import { profileUrl } from '../utils/socialLinks';
import { generateEmail } from '../api/generateEmail';
import { researchTalent } from '../api/researchTalent';

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

  const [researchText, setResearchText] = useState('');
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState('');

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

  async function handleResearch() {
    if (!apiKey.trim()) {
      setResearchError('Enter your Anthropic API key above to research creators.');
      return;
    }
    setResearchError('');
    setResearchLoading(true);
    setResearchText('');
    try {
      const text = await researchTalent({ talent, apiKey: apiKey.trim() });
      setResearchText(text);
    } catch (err) {
      setResearchError(err instanceof Error ? err.message : String(err));
    } finally {
      setResearchLoading(false);
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

  function handleDismissResearch() {
    setResearchText('');
    setResearchError('');
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
          <p className="past-brands">Past brands: {talent.pastBrands.join(', ')}</p>
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
        <p>{talent.audienceDemographic}</p>
      </div>

      <div className="card-actions">
        <a
          className="link-btn"
          href={profileUrl(talent)}
          target="_blank"
          rel="noopener noreferrer"
        >
          View profile ↗
        </a>
        <button
          className="link-btn"
          onClick={handleResearch}
          disabled={researchLoading}
        >
          {researchLoading ? 'Researching…' : '🔎 Research with AI'}
        </button>
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

      {researchError && (
        <div className="research-summary error">
          <p>{researchError}</p>
        </div>
      )}

      {researchText && (
        <div className="research-summary">
          <div className="research-summary-header">
            <p className="research-summary-label">Web research · {talent.name}</p>
            <button className="email-dismiss" onClick={handleDismissResearch} aria-label="Dismiss">×</button>
          </div>
          <pre className="research-summary-text">{researchText}</pre>
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
