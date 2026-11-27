import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";
import ChartFilterPopover from "./ChartFilterPopover";
import ChartTooltip from "./ChartTooltip";
import { useElementWidth } from "../../hooks/useElementWidth";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { buildAxis } from "../../pages/boardOverviewData";
import {
  GRID_COLOR,
  LINE_SERIES,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from "./chartTheme";
import "./RiskTrendChart.scss";

const QUARTER_PADDING_RATIO = 0.27;

export default function RiskTrendChart({
  filter,
  resetValue,
  onFilterChange,
  data,
}) {
  const { ref, width } = useElementWidth();
  const reducedMotion = usePrefersReducedMotion();

  const axis = buildAxis(
    Math.max(
      ...data.map((point) => Math.max(point.fraudLoss, point.fraudPrevented)),
    ),
    filter.duration,
  );
  const sidePadding =
    data.length <= 4 ? Math.round(width * QUARTER_PADDING_RATIO) : 24;

  return (
    <ChartCard
      className="trend-card"
      title="Financial Crime Risk Trends"
      subtitle="Fraud Loss vs Fraud Prevented"
      filter={
        <ChartFilterPopover
          value={filter}
          resetValue={resetValue}
          onApply={onFilterChange}
          ariaLabel="Filter Financial Crime Risk Trends"
        />
      }
    >
      <div className="chart-card-plot" ref={ref}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 9, right: 20, bottom: 0, left: 20 }}
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
            {LINE_SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.name}
                stroke={series.color}
                strokeWidth={1}
                dot={{ r: 3, fill: series.color, stroke: series.color }}
                activeDot={{ r: 5 }}
                isAnimationActive={!reducedMotion}
                animationDuration={500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className="trend-legend">
        {LINE_SERIES.map((series) => (
          <li key={series.key} className="trend-legend-item text-body">
            <span
              className="trend-legend-dot"
              style={{ background: series.color }}
            />
            {series.name}
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
