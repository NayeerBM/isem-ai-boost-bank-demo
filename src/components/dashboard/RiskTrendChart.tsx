import { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartFilterPopover from './ChartFilterPopover';
import ChartTooltip from './ChartTooltip';
import { useElementWidth } from '../../hooks/useElementWidth';
import {
  AXIS_FLOOR,
  buildSeries,
  defaultChartFilter,
  niceAxis,
  type ChartFilter,
  type GlobalFilter,
} from '../../data/dashboardData';
import { AXIS_TICK, GRID_COLOR, LINE_COLORS } from './chartTheme';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface RiskTrendChartProps {
  global: GlobalFilter;
}

const SERIES = [
  { key: 'fraudLoss', name: 'Fraud Loss', color: LINE_COLORS.fraudLoss },
  { key: 'fraudPrevented', name: 'Fraud Prevented', color: LINE_COLORS.fraudPrevented },
] as const;

export default function RiskTrendChart({ global }: RiskTrendChartProps) {
  const [filter, setFilter] = useState<ChartFilter>(() => defaultChartFilter(global));
  const effectiveFilter = useMemo(
    () => (filter.duration === 'quarterly' ? { ...filter, year: global.year } : filter),
    [filter, global.year],
  );
  const data = useMemo(() => buildSeries(effectiveFilter, global), [effectiveFilter, global]);
  const axis = niceAxis(
    Math.max(...data.map((d) => Math.max(d.fraudLoss, d.fraudPrevented))),
    AXIS_FLOOR[effectiveFilter.duration],
  );
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const reducedMotion = usePrefersReducedMotion();

  // In the design the 4 quarters sit in the middle ~45% of the chart.
  // With more points we use the full width.
  const sidePadding = data.length <= 4 ? Math.round(width * 0.27) : 24;

  return (
    <section className="dash-card chart-card chart-card--trend">
      <header className="chart-card__header">
        <div>
          <h3 className="chart-card__title">Financial Crime Risk Trends</h3>
          <p className="chart-card__subtitle">Fraud Loss vs Fraud Prevented</p>
        </div>
        <ChartFilterPopover
          value={effectiveFilter}
          resetValue={defaultChartFilter(global)}
          onApply={setFilter}
          ariaLabel="Filter Financial Crime Risk Trends"
        />
      </header>

      <div className="chart-card__chart chart-card__chart--trend" ref={ref}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 9, right: 20, bottom: 0, left: 20 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              tickMargin={12}
              interval={0}
              padding={{ left: sidePadding, right: sidePadding }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              domain={[0, axis.max]}
              ticks={axis.ticks}
              width={40}
              tickMargin={10}
            />
            <Tooltip cursor={{ stroke: GRID_COLOR }} content={<ChartTooltip />} />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={1}
                dot={{ r: 3, fill: s.color, stroke: s.color }}
                activeDot={{ r: 5 }}
                isAnimationActive={!reducedMotion}
                animationDuration={500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className="chart-legend">
        {SERIES.map((s) => (
          <li key={s.key} className="chart-legend__item">
            <span className="chart-legend__dot" style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
