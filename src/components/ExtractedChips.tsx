import type { ExtractedFilters } from '../api/extractFilters';

interface Props {
  filters: ExtractedFilters;
}

interface Chip {
  key: string;
  label: string;
  set: boolean;
}

function formatFollowers(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}k`;
}

function buildChips(f: ExtractedFilters): Chip[] {
  const chips: Chip[] = [];

  chips.push(f.platform
    ? { key: 'platform', label: f.platform, set: true }
    : { key: 'platform', label: 'Any platform', set: false });

  chips.push(f.niche
    ? { key: 'niche', label: f.niche, set: true }
    : { key: 'niche', label: 'Any niche', set: false });

  chips.push(f.gender
    ? { key: 'gender', label: f.gender, set: true }
    : { key: 'gender', label: 'Any gender', set: false });

  let sizeLabel = 'Any size';
  let sizeSet = false;
  if (f.followerTier) {
    const tierLabels: Record<string, string> = {
      nano: 'Nano (<50k)',
      micro: 'Micro (50k–250k)',
      mid: 'Mid (250k–1M)',
      macro: 'Macro (1M+)',
    };
    sizeLabel = tierLabels[f.followerTier] ?? f.followerTier;
    sizeSet = true;
  } else if (f.minFollowers != null && f.maxFollowers != null) {
    sizeLabel = `${formatFollowers(f.minFollowers)}–${formatFollowers(f.maxFollowers)}`;
    sizeSet = true;
  } else if (f.maxFollowers != null) {
    sizeLabel = `Under ${formatFollowers(f.maxFollowers)}`;
    sizeSet = true;
  } else if (f.minFollowers != null) {
    sizeLabel = `${formatFollowers(f.minFollowers)}+`;
    sizeSet = true;
  }
  chips.push({ key: 'size', label: sizeLabel, set: sizeSet });

  if (f.performance === 'high') {
    chips.push({ key: 'performance', label: 'High-performing', set: true });
  }

  return chips;
}

export default function ExtractedChips({ filters }: Props) {
  const chips = buildChips(filters);
  return (
    <div className="extracted-chips" role="list" aria-label="Criteria extracted from your brief">
      <span className="extracted-chips-label">System understood:</span>
      {chips.map(chip => (
        <span
          key={chip.key}
          role="listitem"
          className={`extracted-chip${chip.set ? '' : ' unset'}`}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}
