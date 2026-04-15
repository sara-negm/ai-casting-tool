interface Props {
  resultCount: number | null;
}

export default function SiteHeader({ resultCount }: Props) {
  return (
    <div className="header">
      <div>
        <p className="eyebrow">AI Casting</p>
        <h1>Talent Search</h1>
      </div>
      <p id="result-count">
        {resultCount != null
          ? `${resultCount} talent${resultCount === 1 ? '' : 's'}`
          : ''}
      </p>
    </div>
  );
}
