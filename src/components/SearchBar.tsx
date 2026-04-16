interface Props {
  value: string;
  onChange: (value: string) => void;
  onAiSearch: () => void;
  loading: boolean;
}

export default function SearchBar({ value, onChange, onAiSearch, loading }: Props) {
  return (
    <div className="search-row">
      <input
        id="search-input"
        placeholder='Search by name, niche, brand… or describe who you need for AI ranking'
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onAiSearch(); }}
      />
      <button id="search-btn" onClick={onAiSearch} disabled={loading || !value.trim()}>
        {loading ? 'Ranking…' : 'Search with AI →'}
      </button>
    </div>
  );
}
