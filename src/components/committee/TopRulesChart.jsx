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
import { AXIS_TICK, GRID_COLOR } from "../dashboard/chartTheme";
import "./TopRulesChart.scss";

const LABEL_WIDTH = 100;
const LABEL_GAP = 21;
const MAX_CHARS_PER_LINE = 15;
const LINE_HEIGHT = 18;
const NARROW_WIDTH = 640;

function wrapLabel(text) {
  return text.split(" ").reduce((lines, word) => {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length <= MAX_CHARS_PER_LINE) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
    return lines;
  }, []);
}

function RuleTick({ x, y, payload }) {
  const lines = wrapLabel(payload.value);
  const firstLineOffset = -((lines.length - 1) * LINE_HEIGHT) / 2;
  return (
    <text x={x} y={y} textAnchor="end" dominantBaseline="middle" {...AXIS_TICK}>
      {lines.map((line, index) => (
        <tspan
          key={line}
          x={x}
          dy={index === 0 ? firstLineOffset : LINE_HEIGHT}
        >
          {line}
        </tspan>
      ))}
    </text>
  );
}

const NUMBER_AXIS_PROPS = {
  type: "number",
  axisLine: false,
  tickLine: false,
  tick: AXIS_TICK,
  interval: 0,
};

export default function TopRulesChart({
  filter,
  resetValue,
  onFilterChange,
  period,
  data,
  axis,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, width } = useElementWidth();
  const domain = [0, axis.max];
  const ticks =
    width && width < NARROW_WIDTH
      ? axis.ticks.filter((_, index) => index % 2 === 0)
      : axis.ticks;

  return (
    <ChartCard
      className="rules-card"
      title="Top 10 Rules Generating Red Flags"
      subtitle="Rules Summary"
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
          ariaLabel="Filter Top 10 Rules Generating Red Flags"
        />
      }
    >
      <div className="chart-card-plot rules-card-plot" ref={ref}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, bottom: 0, left: 20 }}
          >
            <CartesianGrid
              horizontal={false}
              stroke={GRID_COLOR}
              xAxisId="count"
            />
            <XAxis
              {...NUMBER_AXIS_PROPS}
              xAxisId="share"
              orientation="top"
              domain={domain}
              ticks={ticks}
              tickFormatter={(value) =>
                `${Math.round((value / axis.max) * 100)}%`
              }
            />
            <XAxis
              {...NUMBER_AXIS_PROPS}
              xAxisId="count"
              domain={domain}
              ticks={ticks}
            />
            <YAxis
              type="category"
              dataKey="rule"
              axisLine={false}
              tickLine={false}
              width={LABEL_WIDTH + LABEL_GAP}
              tickMargin={LABEL_GAP}
              interval={0}
              tick={<RuleTick />}
            />
            <Tooltip
              cursor={{ fill: "rgba(9, 40, 95, 0.04)" }}
              content={<ChartTooltip />}
            />
            <Bar
              dataKey="redFlags"
              name="Red flags"
              xAxisId="count"
              barSize={20}
              radius={[0, 2, 2, 0]}
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
