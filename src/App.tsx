import { useEffect, useMemo, useState } from 'react';
import { TALENT } from './data/talent';
import { applyFilters, EMPTY_FILTERS } from './utils/filters';
import { searchTalent } from './utils/search';
import { rankTalent } from './api/rankTalent';
import type { Filters, RankingMap, Talent } from './types';
import ApiBanner from './components/ApiBanner';
import SiteHeader from './components/SiteHeader';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import TalentGrid from './components/TalentGrid';
import SelectionBar from './components/SelectionBar';
import ContactModal from './components/ContactModal';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [rankings, setRankings] = useState<RankingMap>({});
  const [baseResults, setBaseResults] = useState<Talent[]>([...TALENT]);
  const [hasSearched, setHasSearched] = useState(true);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [contactOpen, setContactOpen] = useState(false);

  const visibleResults = useMemo(
    () => applyFilters(baseResults, filters),
    [baseResults, filters]
  );

  const selectedTalents = useMemo(
    () => TALENT.filter(t => selectedIds.has(t.id)),
    [selectedIds]
  );

  useEffect(() => {
    const matches = searchTalent(TALENT, query);
    setBaseResults(matches);
    setRankings({});
    setStatus(
      query.trim()
        ? `Showing ${matches.length} match${matches.length === 1 ? '' : 'es'} for "${query.trim()}"`
        : ''
    );
  }, [query]);

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function handleContactSent() {
    setContactOpen(false);
    setSelectedIds(new Set());
    setStatus(`Message sent to ${selectedTalents.length} creator${selectedTalents.length === 1 ? '' : 's'}.`);
  }

  async function runAiSearch() {
    const q = query.trim();
    if (!q) return;
    if (!apiKey.trim()) {
      setStatus('Please enter your Anthropic API key above.');
      return;
    }

    setLoading(true);
    setStatus('Ranking talent…');
    setRankings({});

    try {
      const results = await rankTalent({ query: q, apiKey: apiKey.trim(), talent: TALENT });
      const nextRankings: RankingMap = {};
      results.forEach(r => { nextRankings[r.id] = r; });
      const sorted = [...TALENT].sort(
        (a, b) => (nextRankings[b.id]?.score ?? 0) - (nextRankings[a.id]?.score ?? 0)
      );
      setRankings(nextRankings);
      setBaseResults(sorted);
      setHasSearched(true);
      setStatus(`Ranked ${results.length} creators for "${q}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS);
    setQuery('');
    setApiKey('');
    setRankings({});
    setBaseResults([...TALENT]);
    setHasSearched(true);
    setStatus('');
    setSelectedIds(new Set());
  }

  return (
    <div className={`page${hasSearched ? '' : ' landing'}`}>
      <ApiBanner value={apiKey} onChange={setApiKey} />

      <SiteHeader resultCount={hasSearched ? visibleResults.length : null} />

      <SearchBar
        value={query}
        onChange={setQuery}
        onAiSearch={runAiSearch}
        loading={loading}
      />

      <FilterBar filters={filters} onChange={setFilters} onClear={clearAll} />

      <TalentGrid
        talents={visibleResults}
        rankings={rankings}
        hasSearched={hasSearched}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        apiKey={apiKey}
        context={query}
      />

      <p id="ai-status">{status}</p>

      <SelectionBar
        count={selectedIds.size}
        onClear={clearSelection}
        onContact={() => setContactOpen(true)}
      />

      {contactOpen && (
        <ContactModal
          recipients={selectedTalents}
          onClose={() => setContactOpen(false)}
          onSent={handleContactSent}
        />
      )}
    </div>
  );
}
