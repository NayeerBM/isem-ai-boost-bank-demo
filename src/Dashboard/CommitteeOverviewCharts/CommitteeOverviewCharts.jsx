import { Tooltip } from "antd";
import FilterPill from "../../components/dashboard/FilterPill";
import quarterIcon from "../../assets/icons/circle-progress-quarter.svg";
import calendarIcon from "../../assets/icons/calendar-dates.svg";
import flagIcon from "../../assets/icons/flag.svg";
import folderIcon from "../../assets/icons/folder-open.svg";
import plusIcon from "../../assets/icons/plus-circle-dotted.svg";
import shieldIcon from "../../assets/icons/shield-alert.svg";
import clockIcon from "../../assets/icons/clock-alert.svg";
import {
  QUARTER_OPTIONS,
  YEAR_OPTIONS,
  defaultChartFilter,
  exportFileName,
} from "../DashboardChartsFilterPopover/dashboardChartPeriods";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import ChartFilterPopover from "../../components/dashboard/ChartFilterPopover";
import { useElementWidth } from "../../hooks/useElementWidth";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import {
  INFLOW_SERIES,
  DEFAULT_GLOBAL_FILTER,
  buildAppetite,
  buildExportRows,
  buildBacklog,
  buildTopRules,
  buildInflowAxis,
  buildInflowSeries,
  buildKpiRows,
  defaultInflowFilter,
  withGlobalYear,
} from "./committeeOverviewChartsData";
import {
  GRID_COLOR,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
  AXIS_TICK,
} from "../../components/dashboard/chartTheme";
import { CalendarOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { downloadCsv } from "../../utils/downloadCsv";
import shareIcon from "../../assets/icons/share.svg";
import "../../components/dashboard/ChartCard.scss";
import "../../components/dashboard/ChartTooltip.scss";
import "./CommitteeOverviewCharts.scss";

function ChartCard({
  title,
  subtitle,
  badge,
  filter,
  className = "",
  children,
}) {
  return (
    <section className={`card chart-card ${className}`.trim()}>
      <header className="chart-card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="chart-card-subtitle text-body">
            {subtitle}
            {badge && <span className="chart-card-badge">{badge}</span>}
          </p>
        </div>
        {filter}
      </header>
      {children}
    </section>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="chart-tooltip-row">
          <span
            className="chart-tooltip-dot"
            style={{ background: entry.color ?? entry.payload?.fill }}
          />
          <span>{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ExportButton({ onClick }) {
  return (
    <div className="page-toolbar">
      <Tooltip title="Export CSV" placement="left">
        <button
          type="button"
          className="icon-button"
          onClick={onClick}
          aria-label="Export dashboard data as CSV"
        >
          <img src={shareIcon} alt="" width={20} height={20} />
        </button>
      </Tooltip>
    </div>
  );
}

const ICONS = {
  flag: flagIcon,
  folder: folderIcon,
  plus: plusIcon,
  shield: shieldIcon,
  clock: clockIcon,
};

const QUARTER_PILL_OPTIONS = QUARTER_OPTIONS.map((quarter) => ({
  label: `Q${quarter}`,
  value: quarter,
}));

const YEAR_PILL_OPTIONS = YEAR_OPTIONS.map((year) => ({
  label: String(year),
  value: year,
}));

function KpiCard({ card, tone }) {
  const icon = ICONS[card.icon];
  return (
    <article className={`committee-kpi committee-kpi-${card.tone ?? tone}`}>
      <span className="text-value">{card.value}</span>
      <span className="committee-kpi-label text-body">{card.label}</span>
      <span className="committee-kpi-caption text-caption">{card.caption}</span>
      {icon && (
        <span
          className="committee-kpi-icon"
          style={{
            maskImage: `url("${icon}")`,
            WebkitMaskImage: `url("${icon}")`,
          }}
          aria-hidden="true"
        />
      )}
    </article>
  );
}

function CommitteeOverviewSection({ filter, rows, onFilterChange }) {
  return (
    <section className="card committee-overview-section">
      <header className="committee-overview-section-header">
        <h2 className="card-title">Overview</h2>
        <div className="committee-overview-section-filters">
          <FilterPill
            icon={quarterIcon}
            placeholder="Filter Quarter"
            clearLabel="All Quarters"
            value={filter.quarter}
            options={QUARTER_PILL_OPTIONS}
            onChange={(quarter) => onFilterChange({ ...filter, quarter })}
          />
          <FilterPill
            icon={calendarIcon}
            placeholder="Filter Year"
            value={filter.year}
            options={YEAR_PILL_OPTIONS}
            onChange={(year) =>
              onFilterChange({ ...filter, year: year ?? filter.year })
            }
          />
        </div>
      </header>

      {rows.map((row) => (
        <div key={row.key} className="committee-overview-section-row">
          {row.cards.map((card) => (
            <KpiCard key={card.key} card={card} tone={row.tone} />
          ))}
        </div>
      ))}
    </section>
  );
}

const FEW_POINTS_PADDING_RATIO = 0.28;
const INFLOW_NARROW_WIDTH = 700;

function InflowCompletionChart({
  filter,
  resetValue,
  onFilterChange,
  data,
  axis,
}) {
  const { ref, width } = useElementWidth();
  const reducedMotion = usePrefersReducedMotion();
  const sidePadding =
    data.length <= 5 && width >= INFLOW_NARROW_WIDTH
      ? Math.round(width * FEW_POINTS_PADDING_RATIO)
      : 24;
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
            <RechartsTooltip
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

const SIDE_PADDING_RATIO = 0.2;
const BACKLOG_NARROW_WIDTH = 700;

function BacklogChart({
  filter,
  resetValue,
  onFilterChange,
  period,
  data,
  axis,
}) {
  const { ref, width } = useElementWidth();
  const reducedMotion = usePrefersReducedMotion();
  const sidePadding =
    width >= BACKLOG_NARROW_WIDTH ? Math.round(width * SIDE_PADDING_RATIO) : 8;

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
              tickFormatter={(label) =>
                width >= BACKLOG_NARROW_WIDTH
                  ? label
                  : label.replace(" Days", "d")
              }
            />
            <YAxis
              {...Y_AXIS_PROPS}
              domain={[0, axis.max]}
              ticks={axis.ticks}
            />
            <RechartsTooltip
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

const LABEL_WIDTH = 100;
const LABEL_GAP = 21;
const MAX_CHARS_PER_LINE = 15;
const LINE_HEIGHT = 18;
const RULES_NARROW_WIDTH = 640;

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

function TopRulesChart({
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
    width && width < RULES_NARROW_WIDTH
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
            <RechartsTooltip
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

function ClientRiskAppetite({ items }) {
  return (
    <section className="card client-appetite">
      <h3 className="card-title">Client Risk Appetite</h3>
      <div className="client-appetite-grid">
        {items.map((item) => (
          <article key={item.key} className="client-appetite-item">
            <span className="text-body">{item.title}</span>
            <span className="text-value">{item.value}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function defaultChartFilters(globalFilter) {
  return {
    inflow: defaultInflowFilter(globalFilter),
    backlog: defaultChartFilter(globalFilter),
    rules: defaultChartFilter(globalFilter),
  };
}

export default function CommitteeOverviewCharts() {
  const [filter, setFilter] = useState(DEFAULT_GLOBAL_FILTER);
  const [chartFilters, setChartFilters] = useState(() =>
    defaultChartFilters(DEFAULT_GLOBAL_FILTER),
  );

  const resetFilters = defaultChartFilters(filter);
  const setChartFilter = (key) => (value) =>
    setChartFilters((prev) => ({ ...prev, [key]: value }));

  const kpiRows = useMemo(() => buildKpiRows(filter), [filter]);

  const inflow = useMemo(() => {
    const applied = withGlobalYear(chartFilters.inflow, filter);
    const data = buildInflowSeries(applied, filter);
    return {
      filter: applied,
      data,
      axis: buildInflowAxis(data, applied.duration),
    };
  }, [chartFilters.inflow, filter]);

  const backlog = useMemo(() => {
    const applied = withGlobalYear(chartFilters.backlog, filter);
    return { filter: applied, ...buildBacklog(applied, filter) };
  }, [chartFilters.backlog, filter]);

  const rules = useMemo(() => {
    const applied = withGlobalYear(chartFilters.rules, filter);
    return { filter: applied, ...buildTopRules(applied, filter) };
  }, [chartFilters.rules, filter]);

  const appetite = useMemo(() => buildAppetite(filter), [filter]);

  const handleExport = () => {
    downloadCsv(
      exportFileName("committee-overview", filter),
      buildExportRows({
        globalFilter: filter,
        kpiRows,
        inflow,
        backlog,
        rules,
        appetite,
      }),
    );
  };

  return (
    <main className="page">
      <div className="committee-overview">
        <ExportButton onClick={handleExport} />

        <CommitteeOverviewSection
          filter={filter}
          rows={kpiRows}
          onFilterChange={setFilter}
        />

        <InflowCompletionChart
          filter={inflow.filter}
          resetValue={resetFilters.inflow}
          onFilterChange={setChartFilter("inflow")}
          data={inflow.data}
          axis={inflow.axis}
        />

        <BacklogChart
          filter={backlog.filter}
          resetValue={resetFilters.backlog}
          onFilterChange={setChartFilter("backlog")}
          period={backlog.period}
          data={backlog.data}
          axis={backlog.axis}
        />

        <TopRulesChart
          filter={rules.filter}
          resetValue={resetFilters.rules}
          onFilterChange={setChartFilter("rules")}
          period={rules.period}
          data={rules.data}
          axis={rules.axis}
        />

        <ClientRiskAppetite items={appetite} />
      </div>
    </main>
  );
}
