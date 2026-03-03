export function CardShell({ children }) {
  return <div className="rounded-ds16 border border-line bg-surface p-4 shadow-elevation1 md:p-5">{children}</div>;
}

export function TooltipBody({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-ds10 border border-line bg-surface p-2 text-xs shadow-elevation2">
      <p className="font-semibold text-ink">{label}</p>
      {payload.map((point) => (
        <p key={point.dataKey} className="mt-1 text-muted">
          <span className="font-medium text-ink">{point.name}:</span> {point.value}
        </p>
      ))}
    </div>
  );
}
