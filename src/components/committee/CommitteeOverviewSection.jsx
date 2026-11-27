import FilterPill from "../dashboard/FilterPill";
import quarterIcon from "../../assets/icons/circle-progress-quarter.svg";
import calendarIcon from "../../assets/icons/calendar-dates.svg";
import flagIcon from "../../assets/icons/flag.svg";
import folderIcon from "../../assets/icons/folder-open.svg";
import plusIcon from "../../assets/icons/plus-circle-dotted.svg";
import shieldIcon from "../../assets/icons/shield-alert.svg";
import clockIcon from "../../assets/icons/clock-alert.svg";
import { QUARTER_OPTIONS, YEAR_OPTIONS } from "../../pages/boardOverviewData";
import "./CommitteeOverviewSection.scss";

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
          style={{ maskImage: `url(${icon})`, WebkitMaskImage: `url(${icon})` }}
          aria-hidden="true"
        />
      )}
    </article>
  );
}

export default function CommitteeOverviewSection({
  filter,
  rows,
  onFilterChange,
}) {
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
