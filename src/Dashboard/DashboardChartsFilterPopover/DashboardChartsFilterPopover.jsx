import { useState } from "react";
import { Button, Dropdown, Popover, Select, Tooltip } from "antd";
import filterIcon from "../../assets/icons/filter.svg";
import refreshIcon from "../../assets/icons/refresh.svg";
import minusIcon from "../../assets/icons/minus.svg";
import chevronDown from "../../assets/icons/chevron-down.svg";
import {
  DURATION_OPTIONS,
  MONTH_OPTIONS,
  YEAR_OPTIONS,
} from "./dashboardChartPeriods";
import pillChevronDown from "../../assets/icons/chevron-down-light.svg";
import "./DashboardChartsFilterPopover.scss";

const YEAR_SELECT_OPTIONS = YEAR_OPTIONS.map((year) => ({
  label: String(year),
  value: year,
}));

const STATISTICS_LABEL = {
  monthly: "Set Monthly Statistics",
  weekly: "Set Weekly Statistics",
};

function FilterSelect({ label, large = false, ...props }) {
  return (
    <div className="chart-filter-field">
      <label className="chart-filter-label">{label}</label>
      <Select
        className={`chart-filter-select${large ? " chart-filter-select-lg" : ""}`}
        suffixIcon={<img src={chevronDown} alt="" width={20} height={20} />}
        getPopupContainer={(trigger) => trigger.parentElement}
        {...props}
      />
    </div>
  );
}

export default function DashboardChartsFilterPopover({
  value,
  resetValue,
  onApply,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setDraft(value);
    setOpen(nextOpen);
  };

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const statisticsLabel = STATISTICS_LABEL[draft.duration];

  const content = (
    <div className="chart-filter">
      <div className="chart-filter-header">
        <span className="chart-filter-title">Filters</span>
        <div className="chart-filter-actions">
          <Tooltip title="Reset">
            <button
              type="button"
              className="chart-filter-icon-button"
              onClick={() => setDraft(resetValue)}
              aria-label="Reset filters"
            >
              <img src={refreshIcon} alt="" width={14} height={14} />
            </button>
          </Tooltip>
          <Tooltip title="Close">
            <button
              type="button"
              className="chart-filter-icon-button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
            >
              <img src={minusIcon} alt="" width={14} height={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="chart-filter-body">
        <FilterSelect
          label="Duration"
          value={draft.duration}
          options={DURATION_OPTIONS}
          onChange={(duration) => update({ duration })}
        />

        {statisticsLabel && (
          <div className="chart-filter-field">
            <span className="chart-filter-label">{statisticsLabel}</span>
            <div className="chart-filter-group">
              <FilterSelect
                label="Year"
                large
                value={draft.year}
                options={YEAR_SELECT_OPTIONS}
                onChange={(year) => update({ year })}
              />
              {draft.duration === "weekly" && (
                <FilterSelect
                  label="Month"
                  large
                  value={draft.month}
                  options={MONTH_OPTIONS}
                  onChange={(month) => update({ month })}
                />
              )}
            </div>
          </div>
        )}

        <Button
          type="primary"
          className="chart-filter-apply"
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      content={content}
      overlayClassName="chart-filter-overlay"
      destroyTooltipOnHide
    >
      <button type="button" className="icon-button" aria-label={ariaLabel}>
        <img src={filterIcon} alt="" width={20} height={20} />
      </button>
    </Popover>
  );
}

const CLEAR_KEY = "all";

export function FilterPill({
  icon,
  placeholder,
  value,
  options,
  onChange,
  clearLabel,
}) {
  const selected = options.find((option) => option.value === value);

  const items = [
    ...(clearLabel ? [{ key: CLEAR_KEY, label: clearLabel }] : []),
    ...options.map((option) => ({
      key: String(option.value),
      label: option.label,
    })),
  ];

  const handleClick = ({ key }) => {
    const option = options.find((item) => String(item.value) === key);
    onChange(option ? option.value : null);
  };

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: [value === null ? CLEAR_KEY : String(value)],
        onClick: handleClick,
      }}
      trigger={["click"]}
      placement="bottomRight"
      overlayClassName="filter-pill-menu"
    >
      <button
        type="button"
        className={`filter-pill${selected ? " filter-pill-active" : ""}`}
      >
        <img src={icon} alt="" width={20} height={20} />
        <span className="filter-pill-text">
          {selected ? selected.label : placeholder}
        </span>
        <img src={pillChevronDown} alt="" width={20} height={20} />
      </button>
    </Dropdown>
  );
}
