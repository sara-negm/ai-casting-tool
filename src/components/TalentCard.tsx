import { useState } from 'react';
import type { Ranking, Talent } from '../types';
import { followerLabel } from '../utils/followers';
import { profileUrl } from '../utils/socialLinks';
import { generateEmail } from '../api/generateEmail';
import { researchTalent } from '../api/researchTalent';
import {
  Trophy,
  CircleCheck,
  Circle,
  Smartphone,
  BarChart3,
  Search,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  X,
} from 'lucide-react';

interface Props {
  talent: Talent;
  ranking?: Ranking;
  rank?: number;
  selected: boolean;
  onToggleSelect: (id: number) => void;
  context: string;
}

function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('');
}

export default function TalentCard({
  talent,
  ranking,
  rank,
  selected,
  onToggleSelect,
  context,
}: Props) {
  const [emailText, setEmailText] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [copied, setCopied] = useState(false);

  const [researchText, setResearchText] = useState('');
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState('');

  const tier = !ranking
    ? 'none'
    : ranking.score >= 85
      ? 'best'
      : ranking.score >= 70
        ? 'strong'
        : ranking.score >= 55
          ? 'good'
          : 'none';
  const isTop = tier === 'best';
  const showRank = !!ranking && rank != null && rank <= 3;
  const classes = [
    'card',
    isTop && 'top-pick',
    tier !== 'none' && 'has-badge',
    showRank && `rank-${rank}`,
    selected && 'selected',
  ].filter(Boolean).join(' ');

  const tierBadge: Record<typeof tier, { label: string; icon: React.ReactNode; cls: string } | null> = {
    best: { label: 'Best Match', icon: <Trophy size={12} />, cls: 'badge-best' },
    strong: { label: 'Strong Match', icon: <CircleCheck size={12} />, cls: 'badge-strong' },
    good: { label: 'Good Match', icon: <Circle size={12} />, cls: 'badge-good' },
    none: null,
  };
  const badge = tierBadge[tier];

  async function handleGenerate() {
    setEmailError('');
    setEmailLoading(true);
    setEmailText('');
    try {
      const text = await generateEmail({ talent, context });
      setEmailText(text);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : String(err));
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleResearch() {
    setResearchError('');
    setResearchLoading(true);
    setResearchText('');
    try {
      const text = await researchTalent({ talent });
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
      {showRank && <div className="rank-badge">#{rank}</div>}
      {badge && (
        <div className={`badge ${badge.cls}`}>
          <span className="badge-icon">{badge.icon}</span> {badge.label}
        </div>
      )}

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

      <div className="data-section">
        <div className="data-section-header">
          <span className="data-group-label">Performance Overview</span>
          <span className="data-legend"><Smartphone size={9} /> Platform <BarChart3 size={9} /> Ad Warehouse</span>
        </div>
        <div className="stats stats-wide">
          <div>
            <p className="stat-val">{followerLabel(talent.followers)}</p>
            <p className="stat-label">Followers</p>
          </div>
          <div className="stat-divider ranking-driver">
            <p className="stat-val">{talent.engagement}%</p>
            <p className="stat-label">Eng. rate</p>
          </div>
          <div className="stat-divider ranking-driver">
            <p className="stat-val">{talent.adPerformance.ctr}</p>
            <p className="stat-label">Ad CTR</p>
          </div>
          <div>
            <p className="stat-val">{talent.adPerformance.completionRate}</p>
            <p className="stat-label">Completion</p>
          </div>
        </div>
        <p className="data-audience">{talent.audienceDemographic}</p>
      </div>

      <div className="card-actions">
        <a
          className="link-btn"
          href={profileUrl(talent)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={13} /> View profile
        </a>
        <button
          className="link-btn"
          onClick={handleResearch}
          disabled={researchLoading}
        >
          {researchLoading ? 'Researching…' : <><Search size={13} /> Research with AI</>}
        </button>
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={emailLoading}
        >
          {emailLoading ? 'Writing…' : <><Sparkles size={13} /> Generate outreach email</>}
        </button>
      </div>

      {ranking && (
        <div className={`ai-reason${isTop ? ' top' : ''}`}>
          <div className="confidence-header">
            <div>
              <p className="ai-reason-label">AI confidence</p>
              <p className="confidence-caption">
                Composite of performance deltas vs niche benchmarks + brief fit
              </p>
            </div>
            <p
              className="confidence-score"
              title="Based on performance vs niche/platform benchmarks + semantic match to the brief. Top picks score 85+."
            >
              {ranking.score}/100
            </p>
          </div>
          <div className="confidence-bar" aria-hidden="true">
            <div className="confidence-fill" style={{ width: `${ranking.score}%` }} />
          </div>
          {ranking.highlights.length > 0 && (
            <ul className="highlights-list">
              {ranking.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
          {ranking.comparative && (
            <div className={`comparative-block ${rank === 1 ? 'is-top' : ''}`}>
              <span className="comparative-label">
                {rank != null && rank <= 3 ? `Why ranked #${rank}` : 'How this ranks vs peers'}
              </span>
              <p className="comparative-text">{ranking.comparative}</p>
            </div>
          )}
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
            <button className="email-dismiss" onClick={handleDismissResearch} aria-label="Dismiss"><X size={16} /></button>
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
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
              <button className="email-dismiss" onClick={handleDismiss} aria-label="Dismiss"><X size={16} /></button>
            </div>
          </div>
          <pre className="generated-email-text">{emailText}</pre>
        </div>
      )}
    </div>
  );
}
