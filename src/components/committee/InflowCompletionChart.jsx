import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../dashboard/ChartCard";
import ChartFilterPopover from "../dashboard/ChartFilterPopover";
import ChartTooltip from "../dashboard/ChartTooltip";
import { useElementWidth } from "../../hooks/useElementWidth";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { INFLOW_SERIES } from "../../pages/committeeOverviewData";
import {
  GRID_COLOR,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from "../dashboard/chartTheme";
import "./InflowCompletionChart.scss";

const FEW_POINTS_PADDING_RATIO = 0.28;

export default function InflowCompletionChart({
  filter,
  resetValue,
  onFilterChange,
  data,
  axis,
}) {
  const { ref, width } = useElementWidth();
  const reducedMotion = usePrefersReducedMotion();
  const sidePadding =
    data.length <= 5 ? Math.round(width * FEW_POINTS_PADDING_RATIO) : 24;
  const hasHighlight = data.some((point) => point.highlighted);

  return (
    <ChartCard
      className="inflow-card"
      title="Red Flag Inflow vs Case Investigation Completion"
      subtitle="Productivity Summary"
      filter={
        <ChartFilterPopover
          value={filter}
          resetValue={resetValue}
          onApply={onFilterChange}
          ariaLabel="Filter Red Flag Inflow vs Case Investigation Completion"
        />
      }
    >
      <div className="chart-card-plot" ref={ref}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 9, right: 20, bottom: 0, left: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
            <XAxis
              {...X_AXIS_PROPS}
              padding={{ left: sidePadding, right: sidePadding }}
            />
            <YAxis
              {...Y_AXIS_PROPS}
              domain={[0, axis.max]}
              ticks={axis.ticks}
            />
            <Tooltip
              cursor={{ stroke: GRID_COLOR }}
              content={<ChartTooltip />}
            />
            {INFLOW_SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.name}
                stroke={series.color}
                strokeWidth={1}
                dot={({ cx, cy, payload, index }) => (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill={series.color}
                    opacity={hasHighlight && !payload.highlighted ? 0.35 : 1}
                  />
                )}
                activeDot={{ r: 5 }}
                isAnimationActive={!reducedMotion}
                animationDuration={500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className="inflow-legend">
        {INFLOW_SERIES.map((series) => (
          <li key={series.key} className="inflow-legend-item text-body">
            <span
              className="inflow-legend-dot"
              style={{ background: series.color }}
            />
            {series.name}
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
