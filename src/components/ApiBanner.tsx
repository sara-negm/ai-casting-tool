interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ApiBanner({ value, onChange }: Props) {
  return (
    <div id="api-banner">
      <label htmlFor="api-key-input">Anthropic API Key</label>
      <input
        id="api-key-input"
        type="password"
        placeholder="sk-ant-..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <span className="hint">Required for AI search · never stored</span>
    </div>
  );
}
