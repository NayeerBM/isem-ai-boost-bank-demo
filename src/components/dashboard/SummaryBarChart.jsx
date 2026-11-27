import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";
import ChartFilterPopover from "./ChartFilterPopover";
import ChartTooltip from "./ChartTooltip";
import SortIcon from "./SortIcon";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import {
  DURATION_SUMMARY,
  SORT_BADGE,
  buildAxis,
} from "../../pages/boardOverviewData";
import {
  BAR_COLORS,
  GRID_COLOR,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from "./chartTheme";

export default function SummaryBarChart({
  title,
  metric,
  filter,
  resetValue,
  onFilterChange,
  data,
}) {
  const reducedMotion = usePrefersReducedMotion();

  const axis = buildAxis(
    Math.max(...data.map((point) => point[metric])),
    filter.duration,
  );
  const hasHighlight = data.some((point) => point.highlighted);

  return (
    <ChartCard
      title={title}
      subtitle={DURATION_SUMMARY[filter.duration]}
      badge={
        SORT_BADGE[filter.sort] && (
          <>
            <SortIcon sort={filter.sort} />
            {SORT_BADGE[filter.sort]}
          </>
        )
      }
      filter={
        <ChartFilterPopover
          value={filter}
          resetValue={resetValue}
          onApply={onFilterChange}
          showSort
          ariaLabel={`Filter ${title}`}
        />
      }
    >
      <div className="chart-card-plot">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 9, right: 10, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis {...X_AXIS_PROPS} />
            <YAxis
              {...Y_AXIS_PROPS}
              domain={[0, axis.max]}
              ticks={axis.ticks}
            />
            <Tooltip
              cursor={{ fill: "rgba(9, 40, 95, 0.04)" }}
              content={<ChartTooltip />}
            />
            <Bar
              dataKey={metric}
              name={title}
              barSize={10}
              radius={[2, 2, 0, 0]}
              isAnimationActive={!reducedMotion}
              animationDuration={500}
            >
              {data.map((point, index) => (
                <Cell
                  key={point.key}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                  fillOpacity={hasHighlight && !point.highlighted ? 0.25 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
