import { useEffect, useMemo, useState } from 'react';
import { TALENT } from './data/talent';
import { applyFilters, EMPTY_FILTERS } from './utils/filters';
import { searchTalent } from './utils/search';
import { computeBenchmarks } from './utils/stats';
import { rankTalent } from './api/rankTalent';
import { applyExtractedFilters, extractBriefFilters, summarizeFilters } from './api/extractFilters';
import type { Filters, RankingMap, Talent } from './types';
import SiteHeader from './components/SiteHeader';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import TalentGrid from './components/TalentGrid';
import SelectionBar from './components/SelectionBar';
import ContactModal from './components/ContactModal';
import PipelineTrace, { type PipelineData } from './components/PipelineTrace';
import ExtractedChips from './components/ExtractedChips';

export default function App() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [rankings, setRankings] = useState<RankingMap>({});
  const [baseResults, setBaseResults] = useState<Talent[]>([...TALENT]);
  const [hasSearched, setHasSearched] = useState(true);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [contactOpen, setContactOpen] = useState(false);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);

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
    setPipeline(null);
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

    setLoading(true);
    setRankings({});
    setPipeline(null);

    try {
      setStatus('Step 1/3 · Parsing brief into structured criteria…');
      const extracted = await extractBriefFilters({ query: q });

      setStatus('Step 2/3 · Filtering dataset locally…');
      const filtered = applyExtractedFilters(TALENT, extracted.filters);

      if (filtered.length === 0) {
        setPipeline({
          interpretation: extracted.interpretation,
          filtersSummary: summarizeFilters(extracted.filters),
          filters: extracted.filters,
          totalPool: TALENT.length,
          afterFilter: 0,
          ranked: 0,
        });
        setBaseResults([]);
        setHasSearched(true);
        setStatus('No creators match the extracted criteria. Try broadening your brief.');
        return;
      }

      setStatus(`Step 3/3 · Ranking ${filtered.length} matches with benchmark-grounded reasons…`);
      const benchmarks = computeBenchmarks(TALENT);
      const results = await rankTalent({
        query: q,
        talent: filtered,
        benchmarks,
      });

      const nextRankings: RankingMap = {};
      results.forEach(r => { nextRankings[r.id] = r; });
      const sorted = [...filtered].sort(
        (a, b) => (nextRankings[b.id]?.score ?? 0) - (nextRankings[a.id]?.score ?? 0)
      );
      setRankings(nextRankings);
      setBaseResults(sorted);
      setHasSearched(true);
      setPipeline({
        interpretation: extracted.interpretation,
        filtersSummary: summarizeFilters(extracted.filters),
        filters: extracted.filters,
        totalPool: TALENT.length,
        afterFilter: filtered.length,
        ranked: results.length,
      });
      setStatus(`Pipeline complete · ${results.length} creators ranked for "${q}"`);
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
    setRankings({});
    setBaseResults([...TALENT]);
    setHasSearched(true);
    setStatus('');
    setSelectedIds(new Set());
    setPipeline(null);
  }

  return (
    <div className={`page${hasSearched ? '' : ' landing'}`}>
      <SiteHeader resultCount={hasSearched ? visibleResults.length : null} />

      <SearchBar
        value={query}
        onChange={setQuery}
        onAiSearch={runAiSearch}
        loading={loading}
      />

      <FilterBar filters={filters} onChange={setFilters} onClear={clearAll} />

      {status && <p id="ai-status">{status}</p>}

      {pipeline && (
        <>
          <ExtractedChips filters={pipeline.filters} />
          <PipelineTrace pipeline={pipeline} />
        </>
      )}

      <TalentGrid
        talents={visibleResults}
        rankings={rankings}
        hasSearched={hasSearched}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        context={query}
      />

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
