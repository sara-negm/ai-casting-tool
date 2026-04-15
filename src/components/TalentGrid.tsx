import type { RankingMap, Talent } from '../types';
import TalentCard from './TalentCard';

interface Props {
  talents: Talent[];
  rankings: RankingMap;
  hasSearched: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  context: string;
}

export default function TalentGrid({
  talents,
  rankings,
  hasSearched,
  selectedIds,
  onToggleSelect,
  context,
}: Props) {
  if (!hasSearched) {
    return <div id="talent-grid" />;
  }

  if (talents.length === 0) {
    return (
      <div id="talent-grid">
        <p className="empty-state">No talent matches these filters.</p>
      </div>
    );
  }

  const rankingsActive = Object.keys(rankings).length > 0;

  return (
    <div id="talent-grid">
      {talents.map((t, index) => (
        <TalentCard
          key={t.id}
          talent={t}
          ranking={rankings[t.id]}
          rank={rankingsActive ? index + 1 : undefined}
          selected={selectedIds.has(t.id)}
          onToggleSelect={onToggleSelect}
          context={context}
        />
      ))}
    </div>
  );
}
