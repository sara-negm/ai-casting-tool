interface Props {
  count: number;
  onClear: () => void;
  onContact: () => void;
}

export default function SelectionBar({ count, onClear, onContact }: Props) {
  if (count === 0) return null;

  return (
    <div className="selection-bar">
      <span className="selection-count">
        {count} creator{count === 1 ? '' : 's'} selected
      </span>
      <div className="selection-actions">
        <button className="selection-clear" onClick={onClear}>Clear</button>
        <button className="selection-contact" onClick={onContact}>Contact →</button>
      </div>
    </div>
  );
}
