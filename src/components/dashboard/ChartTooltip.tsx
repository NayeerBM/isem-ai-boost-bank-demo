import type { TooltipProps } from 'recharts';

/** Dark hover tooltip, styled like the tooltip in the Figma design. */
export default function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map((entry) => (
        <div key={String(entry.dataKey)} className="chart-tooltip__row">
          <span className="chart-tooltip__dot" style={{ background: entry.color ?? entry.payload?.fill }} />
          <span>{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}
