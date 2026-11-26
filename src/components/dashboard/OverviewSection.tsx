import { Tooltip } from 'antd';
import FilterPill from './FilterPill';
import alertCircle from '../../assets/icons/alert-circle.svg';
import arrowIncrease from '../../assets/icons/arrow-increase.svg';
import arrowDecrease from '../../assets/icons/arrow-decrease.svg';
import quarterIcon from '../../assets/icons/circle-progress-quarter.svg';
import calendarIcon from '../../assets/icons/calendar-dates.svg';
import {
  QUARTER_OPTIONS,
  YEAR_OPTIONS,
  formatRM,
  type GlobalFilter,
  type OverviewKpis,
  type Quarter,
} from '../../data/dashboardData';

interface OverviewSectionProps {
  filter: GlobalFilter;
  kpis: OverviewKpis;
  onFilterChange: (next: GlobalFilter) => void;
}

interface KpiCard {
  key: string;
  value: number;
  label?: string;
  description: string;
  /** Change vs previous period; negative is good for incidents. */
  change?: number;
}

function Trend({ value, goodWhenDown = false, suffix = '' }: { value: number; goodWhenDown?: boolean; suffix?: string }) {
  if (value === 0) return null;
  const isUp = value > 0;
  const isGood = goodWhenDown ? !isUp : isUp;
  return (
    <span className={`trend ${isGood ? 'trend--good' : 'trend--bad'}`}>
      <img src={isUp ? arrowIncrease : arrowDecrease} alt={isUp ? 'Increase' : 'Decrease'} width={17.7143} height={10} />
      {isUp ? '' : '-'}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}

export default function OverviewSection({ filter, kpis, onFilterChange }: OverviewSectionProps) {
  const cards: KpiCard[] = [
    { key: 'aml-risk', value: kpis.residualAmlRisk, description: 'Residual AML Risk' },
    { key: 'prevented', value: kpis.fraudPrevented, label: 'prevented', description: 'Fraud Prevented' },
    { key: 'aml-breach', value: kpis.amlBreach, label: 'AML breach', description: 'High-risk customers\nwith generated red flags' },
    { key: 'fraud-breach', value: kpis.fraudBreach, label: 'Fraud breach', description: 'High-risk customers\nwith generated red flags' },
    { key: 'incidents', value: kpis.incidents, label: 'incidents', description: 'Unresolved Fraud\nIncidents', change: kpis.incidentsChange },
    { key: 'reports', value: kpis.strReported, label: 'reports', description: 'STR Reported' },
  ];

  return (
    <section className="dash-card overview">
      <header className="overview__header">
        <h2 className="chart-card__title">Overview</h2>
        <div className="overview__filters">
          <FilterPill<Quarter>
            icon={quarterIcon}
            placeholder="Filter Quarter"
            clearLabel="All Quarters"
            value={filter.quarter}
            options={QUARTER_OPTIONS.map((q) => ({ label: `Q${q}`, value: q }))}
            onChange={(quarter) => onFilterChange({ ...filter, quarter })}
          />
          <FilterPill<number>
            icon={calendarIcon}
            placeholder="Filter Year"
            value={filter.year}
            options={YEAR_OPTIONS.map((y) => ({ label: String(y), value: y }))}
            onChange={(year) => onFilterChange({ ...filter, year: year ?? filter.year })}
          />
        </div>
      </header>

      <div className="overview__losses">
        <div className="overview__losses-label">
          Fraud Losses
          <Tooltip
            title="Amount is sourced manually from the Fraud Maintenance page."
            placement="top"
            overlayClassName="dark-tooltip"
          >
            <img className="overview__info" src={alertCircle} alt="More information" width={12.25} height={12.25} />
          </Tooltip>
        </div>
        <div className="overview__losses-value">
          <span className="text-value">{formatRM(kpis.fraudLossesAmount)}</span>
          <Trend value={kpis.fraudLossesChangePct} goodWhenDown suffix="%" />
        </div>
      </div>

      <div className="overview__kpis">
        {cards.map((card) => (
          <article key={card.key} className="kpi-card">
            <div className="kpi-card__value">
              <span className="text-value">{card.value}</span>
              {card.change !== undefined && <Trend value={card.change} goodWhenDown />}
            </div>
            <div className="kpi-card__label">{card.label}</div>
            <p className="kpi-card__description">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
