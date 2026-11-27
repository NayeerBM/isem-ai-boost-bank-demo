import arrowIncrease from "../../assets/icons/arrow-increase.svg";
import arrowDecrease from "../../assets/icons/arrow-decrease.svg";
import { Tooltip } from "antd";
import alertCircle from "../../assets/icons/alert-circle.svg";
import quarterIcon from "../../assets/icons/circle-progress-quarter.svg";
import calendarIcon from "../../assets/icons/calendar-dates.svg";
import { formatRM } from "../../utils/formatValue";
import {
  buildKpiCards,
  buildAppetite,
  buildExportRows,
  buildKpis,
  buildSeries,
} from "./boardOverviewChartsData";
import {
  QUARTER_SELECT_OPTIONS,
  YEAR_SELECT_OPTIONS,
  DURATION_SUMMARY,
  buildAxis,
  DEFAULT_GLOBAL_FILTER,
  defaultChartFilter,
  exportFileName,
  withGlobalYear,
} from "../DashboardChartsFilterPopover/dashboardChartPeriods";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts";
import DashboardChartsFilterPopover, {
  FilterPill,
} from "../DashboardChartsFilterPopover/DashboardChartsFilterPopover";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import {
  CHART_TOOLTIP_PROPS,
  GRID_COLOR,
  X_AXIS_PROPS,
  Y_AXIS_PROPS,
} from "../../styles/chartTheme";
import { useElementWidth } from "../../hooks/useElementWidth";
import { useMemo, useState } from "react";
import { downloadCsv } from "../../utils/downloadCsv";
import shareIcon from "../../assets/icons/share.svg";
import "./BoardOverviewCharts.scss";

const BAR_COLORS = ["#09285f", "#5273b0", "#8eabe0", "#d5e4ff"];

const LINE_SERIES = [
  { key: "fraudLoss", name: "Fraud Loss", color: "#e53935" },
  { key: "fraudPrevented", name: "Fraud Prevented", color: "#1a7d71" },
];

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

function TrendBadge({ value, suffix = "" }) {
  if (value === 0) return null;
  const isUp = value > 0;

  return (
    <span
      className={`trend-badge ${isUp ? "trend-badge-up" : "trend-badge-down"}`}
    >
      <img
        src={isUp ? arrowIncrease : arrowDecrease}
        alt={isUp ? "Increase" : "Decrease"}
        width={17.7143}
        height={10}
      />
      {isUp ? "" : "-"}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

function OverviewSection({ filter, kpis, onFilterChange }) {
  return (
    <section className="card overview">
      <header className="overview-header">
        <h2 className="card-title">Overview</h2>
        <div className="overview-filters">
          <FilterPill
            icon={quarterIcon}
            placeholder="Filter Quarter"
            clearLabel="All Quarters"
            value={filter.quarter}
            options={QUARTER_SELECT_OPTIONS}
            onChange={(quarter) => onFilterChange({ ...filter, quarter })}
          />
          <FilterPill
            icon={calendarIcon}
            placeholder="Filter Year"
            value={filter.year}
            options={YEAR_SELECT_OPTIONS}
            onChange={(year) =>
              onFilterChange({ ...filter, year: year ?? filter.year })
            }
          />
        </div>
      </header>

      <div className="overview-losses">
        <div className="overview-losses-label text-body">
          Fraud Losses
          <Tooltip
            title="Amount is sourced manually from the Fraud Maintenance page."
            placement="top"
            overlayClassName="dark-tooltip"
          >
            <img
              className="overview-info"
              src={alertCircle}
              alt="More information"
              width={12.25}
              height={12.25}
            />
          </Tooltip>
        </div>
        <div className="overview-losses-value">
          <span className="text-value">{formatRM(kpis.fraudLossesAmount)}</span>
          <TrendBadge value={kpis.fraudLossesChangePct} suffix="%" />
        </div>
      </div>

      <div className="overview-kpis">
        {buildKpiCards(kpis).map((card) => (
          <article key={card.key} className="overview-kpi">
            <div className="overview-kpi-value">
              <span className="text-value">{card.value}</span>
              {card.change !== undefined && <TrendBadge value={card.change} />}
            </div>
            <div className="overview-kpi-label text-body">{card.label}</div>
            <p className="overview-kpi-description text-caption">
              {card.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SummaryBarChart({
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
      filter={
        <DashboardChartsFilterPopover
          value={filter}
          resetValue={resetValue}
          onApply={onFilterChange}
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
            <RechartsTooltip
              cursor={{ fill: "rgba(9, 40, 95, 0.04)" }}
              {...CHART_TOOLTIP_PROPS}
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

const QUARTER_PADDING_RATIO = 0.27;

function RiskTrendChart({ filter, resetValue, onFilterChange, data }) {
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
        <DashboardChartsFilterPopover
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
            <RechartsTooltip
              cursor={{ stroke: GRID_COLOR }}
              {...CHART_TOOLTIP_PROPS}
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

function RiskAppetiteStatus({ items }) {
  return (
    <section className="card appetite">
      <h3 className="card-title">Financial Crime Risk Appetite Status</h3>
      <div className="appetite-grid">
        {items.map((item) => (
          <article key={item.key} className="appetite-item">
            <div className="appetite-item-top">
              <span className="text-body">{item.title}</span>
              <span className={`status-chip status-chip-${item.tone}`}>
                {item.status}
              </span>
            </div>
            <span className="text-value">{item.value}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function defaultChartFilters(globalFilter) {
  return {
    fraudLoss: defaultChartFilter(globalFilter),
    fraudPrevented: defaultChartFilter(globalFilter),
    trend: defaultChartFilter(globalFilter),
  };
}

function buildChart(chartFilter, globalFilter) {
  const filter = withGlobalYear(chartFilter, globalFilter);
  return { filter, data: buildSeries(filter, globalFilter) };
}

export default function BoardOverviewCharts() {
  const [filter, setFilter] = useState(DEFAULT_GLOBAL_FILTER);
  const [chartFilters, setChartFilters] = useState(() =>
    defaultChartFilters(DEFAULT_GLOBAL_FILTER),
  );

  const resetFilters = defaultChartFilters(filter);
  const setChartFilter = (key) => (value) =>
    setChartFilters((prev) => ({ ...prev, [key]: value }));

  const kpis = useMemo(() => buildKpis(filter), [filter]);
  const appetite = useMemo(() => buildAppetite(filter, kpis), [filter, kpis]);

  const fraudLoss = useMemo(
    () => buildChart(chartFilters.fraudLoss, filter),
    [chartFilters.fraudLoss, filter],
  );
  const fraudPrevented = useMemo(
    () => buildChart(chartFilters.fraudPrevented, filter),
    [chartFilters.fraudPrevented, filter],
  );
  const trend = useMemo(
    () => buildChart(chartFilters.trend, filter),
    [chartFilters.trend, filter],
  );

  const handleExport = () => {
    downloadCsv(
      exportFileName("board-overview", filter),
      buildExportRows({
        globalFilter: filter,
        kpis,
        fraudLoss,
        fraudPrevented,
        trend,
        appetite,
      }),
    );
  };

  return (
    <main className="page">
      <div className="board-overview">
        <ExportButton onClick={handleExport} />

        <OverviewSection
          filter={filter}
          kpis={kpis}
          onFilterChange={setFilter}
        />

        <div className="board-overview-charts">
          <SummaryBarChart
            title="Fraud Loss"
            metric="fraudLoss"
            filter={fraudLoss.filter}
            resetValue={resetFilters.fraudLoss}
            onFilterChange={setChartFilter("fraudLoss")}
            data={fraudLoss.data}
          />
          <SummaryBarChart
            title="Fraud Prevented"
            metric="fraudPrevented"
            filter={fraudPrevented.filter}
            resetValue={resetFilters.fraudPrevented}
            onFilterChange={setChartFilter("fraudPrevented")}
            data={fraudPrevented.data}
          />
        </div>

        <RiskTrendChart
          filter={trend.filter}
          resetValue={resetFilters.trend}
          onFilterChange={setChartFilter("trend")}
          data={trend.data}
        />

        <RiskAppetiteStatus items={appetite} />
      </div>
    </main>
  );
}
