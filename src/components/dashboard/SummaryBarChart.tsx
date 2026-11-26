import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartFilterPopover from './ChartFilterPopover';
import ChartTooltip from './ChartTooltip';
import {
  AXIS_FLOOR,
  DURATION_SUMMARY_LABEL,
  buildSeries,
  defaultChartFilter,
  niceAxis,
  sortSeries,
  type ChartFilter,
  type GlobalFilter,
  type Metric,
} from '../../data/dashboardData';
import { AXIS_TICK, BAR_COLORS, GRID_COLOR } from './chartTheme';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface SummaryBarChartProps {
  title: string;
  metric: Metric;
  global: GlobalFilter;
}

export default function SummaryBarChart({ title, metric, global }: SummaryBarChartProps) {
  const [filter, setFilter] = useState<ChartFilter>(() => defaultChartFilter(global));
  // Keep the chart's year in step with the global Year filter.
  const effectiveFilter = useMemo(
    () => (filter.duration === 'quarterly' ? { ...filter, year: global.year } : filter),
    [filter, global.year],
  );

  const data = useMemo(
    () => sortSeries(buildSeries(effectiveFilter, global), metric, effectiveFilter.sort),
    [effectiveFilter, global, metric],
  );
  const axis = niceAxis(Math.max(...data.map((d) => d[metric])), AXIS_FLOOR[effectiveFilter.duration]);
  const anyHighlighted = data.some((d) => d.highlighted);
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className="dash-card chart-card">
      <header className="chart-card__header">
        <div>
          <h3 className="chart-card__title">{title}</h3>
          <p className="chart-card__subtitle">
            {DURATION_SUMMARY_LABEL[effectiveFilter.duration]}
            {effectiveFilter.sort !== 'default' && (
              <span className="chart-card__badge">{effectiveFilter.sort === 'desc' ? 'Highest first' : 'Lowest first'}</span>
            )}
          </p>
        </div>
        <ChartFilterPopover
          value={effectiveFilter}
          resetValue={defaultChartFilter(global)}
          onApply={setFilter}
          showSort
          ariaLabel={`Filter ${title}`}
        />
      </header>

      <div className="chart-card__chart chart-card__chart--bar">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 9, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={AXIS_TICK} tickMargin={12} interval={0} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK}
              domain={[0, axis.max]}
              ticks={axis.ticks}
              width={40}
              tickMargin={10}
            />
            <Tooltip cursor={{ fill: 'rgba(9, 40, 95, 0.04)' }} content={<ChartTooltip />} />
            <Bar
              dataKey={metric}
              name={title}
              barSize={10}
              radius={[2, 2, 0, 0]}
              isAnimationActive={!reducedMotion}
              animationDuration={500}
            >
              {data.map((d, index) => (
                <Cell
                  key={d.key}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                  fillOpacity={anyHighlighted && !d.highlighted ? 0.25 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
