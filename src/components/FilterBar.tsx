import type { ChangeEvent } from 'react';
import type { Filters } from '../types';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube'] as const;
const NICHES = ['Fitness', 'Skincare', 'Food & Beverage', 'Lifestyle', 'Wellness'] as const;
const GENDERS = ['Female', 'Male', 'Non-binary'] as const;
const SIZES = [
  { value: 'nano', label: 'Nano (<50k)' },
  { value: 'micro', label: 'Micro (50k–250k)' },
  { value: 'mid', label: 'Mid (250k–1M)' },
  { value: 'macro', label: 'Macro (1M+)' },
] as const;

export default function FilterBar({ filters, onChange, onClear }: Props) {
  const update = (key: keyof Filters) => (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="filters">
      <select id="f-platform" value={filters.platform} onChange={update('platform')}>
        <option value="">All platforms</option>
        {PLATFORMS.map(p => <option key={p}>{p}</option>)}
      </select>
      <select id="f-niche" value={filters.niche} onChange={update('niche')}>
        <option value="">All niches</option>
        {NICHES.map(n => <option key={n}>{n}</option>)}
      </select>
      <select id="f-gender" value={filters.gender} onChange={update('gender')}>
        <option value="">Any gender</option>
        {GENDERS.map(g => <option key={g}>{g}</option>)}
      </select>
      <select id="f-followers" value={filters.followers} onChange={update('followers')}>
        <option value="">Any size</option>
        {SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <button id="clear-btn" onClick={onClear}>Clear</button>
    </div>
  );
}
