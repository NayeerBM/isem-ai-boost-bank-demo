import { Tooltip } from "antd";
import FilterPill from "./FilterPill";
import TrendBadge from "./TrendBadge";
import alertCircle from "../../assets/icons/alert-circle.svg";
import quarterIcon from "../../assets/icons/circle-progress-quarter.svg";
import calendarIcon from "../../assets/icons/calendar-dates.svg";
import { formatRM } from "../../utils/formatValue";
import { buildKpiCards } from "../../pages/boardOverviewData";
import {
  QUARTER_OPTIONS,
  YEAR_OPTIONS,
} from "../../Dashboard/DashboardChartsFilterPopover/dashboardChartPeriods";
import "./OverviewSection.scss";

const QUARTER_PILL_OPTIONS = QUARTER_OPTIONS.map((quarter) => ({
  label: `Q${quarter}`,
  value: quarter,
}));

const YEAR_PILL_OPTIONS = YEAR_OPTIONS.map((year) => ({
  label: String(year),
  value: year,
}));

export default function OverviewSection({ filter, kpis, onFilterChange }) {
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
