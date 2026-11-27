import { CalendarOutlined } from "@ant-design/icons";
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
import ChartCard from "../dashboard/ChartCard";
import ChartFilterPopover from "../dashboard/ChartFilterPopover";
import ChartTooltip from "../dashboard/ChartTooltip";
import { useElementWidth } from "../../hooks/useElementWidth";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import {
  GRID_COLOR,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from "../dashboard/chartTheme";

const SIDE_PADDING_RATIO = 0.2;

export default function BacklogChart({
  filter,
  resetValue,
  onFilterChange,
  period,
  data,
  axis,
}) {
  const { ref, width } = useElementWidth();
  const reducedMotion = usePrefersReducedMotion();
  const sidePadding = Math.round(width * SIDE_PADDING_RATIO);

  return (
    <ChartCard
      title="AML Investigation Backlogs"
      subtitle="Cases Summary"
      badge={
        <>
          <CalendarOutlined aria-hidden="true" />
          {period.label}
        </>
      }
      filter={
        <ChartFilterPopover
          value={filter}
          resetValue={resetValue}
          onApply={onFilterChange}
          ariaLabel="Filter AML Investigation Backlogs"
        />
      }
    >
      <div className="chart-card-plot" ref={ref}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
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
              cursor={{ fill: "rgba(9, 40, 95, 0.04)" }}
              content={<ChartTooltip />}
            />
            <Bar
              dataKey="cases"
              name="Open cases"
              barSize={10}
              radius={[2, 2, 0, 0]}
              isAnimationActive={!reducedMotion}
              animationDuration={500}
            >
              {data.map((point) => (
                <Cell key={point.key} fill={point.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
