import { useEffect, useState } from 'react';
import { Button, Popover, Select, Tooltip } from 'antd';
import filterIcon from '../../assets/icons/filter.svg';
import refreshIcon from '../../assets/icons/refresh.svg';
import minusIcon from '../../assets/icons/minus.svg';
import chevronDown from '../../assets/icons/chevron-down.svg';
import {
  DURATION_OPTIONS,
  MONTH_OPTIONS,
  SORT_OPTIONS,
  YEAR_OPTIONS,
  type ChartFilter,
} from '../../data/dashboardData';

interface ChartFilterPopoverProps {
  value: ChartFilter;
  /** Value restored by the refresh button. */
  resetValue: ChartFilter;
  onApply: (next: ChartFilter) => void;
  /** Sorting only makes sense for bar charts, not for a time-based trend line. */
  showSort?: boolean;
  ariaLabel: string;
}

const suffixIcon = <img src={chevronDown} alt="" width={20} height={20} />;

export default function ChartFilterPopover({
  value,
  resetValue,
  onApply,
  showSort = false,
  ariaLabel,
}: ChartFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ChartFilter>(value);

  // Start each opening from the applied value.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const update = (patch: Partial<ChartFilter>) => setDraft((prev) => ({ ...prev, ...patch }));

  const apply = () => {
    onApply(draft);
    setOpen(false);
  };

  const content = (
    <div className="chart-filter">
      <div className="chart-filter__header">
        <span className="chart-filter__title">Filters</span>
        <div className="chart-filter__actions">
          <Tooltip title="Reset">
            <button type="button" className="chart-filter__icon-btn" onClick={() => setDraft(resetValue)} aria-label="Reset filters">
              <img src={refreshIcon} alt="" width={14} height={14} />
            </button>
          </Tooltip>
          <Tooltip title="Close">
            <button type="button" className="chart-filter__icon-btn" onClick={() => setOpen(false)} aria-label="Close filters">
              <img src={minusIcon} alt="" width={14} height={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="chart-filter__body">
        <div className="chart-filter__field">
          <label className="chart-filter__label">Duration</label>
          <Select
            className="chart-filter__select"
            value={draft.duration}
            options={DURATION_OPTIONS}
            onChange={(duration) => update({ duration })}
            suffixIcon={suffixIcon}
            getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
          />
        </div>

        {(draft.duration === 'monthly' || draft.duration === 'weekly') && (
          <div className="chart-filter__field">
            <label className="chart-filter__label">
              {draft.duration === 'monthly' ? 'Set Monthly Statistics' : 'Set Weekly Statistics'}
            </label>
            <div className="chart-filter__group">
              <div className="chart-filter__field">
                <label className="chart-filter__label">Year</label>
                <Select
                  className="chart-filter__select chart-filter__select--lg"
                  value={draft.year}
                  options={YEAR_OPTIONS.map((y) => ({ label: String(y), value: y }))}
                  onChange={(year) => update({ year })}
                  suffixIcon={suffixIcon}
                  getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
                />
              </div>
              {draft.duration === 'weekly' && (
                <div className="chart-filter__field">
                  <label className="chart-filter__label">Month</label>
                  <Select
                    className="chart-filter__select chart-filter__select--lg"
                    value={draft.month}
                    options={MONTH_OPTIONS}
                    onChange={(month) => update({ month })}
                    suffixIcon={suffixIcon}
                    getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {showSort && (
          <div className="chart-filter__field">
            <label className="chart-filter__label">Sort</label>
            <Select
              className="chart-filter__select"
              value={draft.sort}
              options={SORT_OPTIONS}
              onChange={(sort) => update({ sort })}
              suffixIcon={suffixIcon}
              getPopupContainer={(trigger) => trigger.parentElement ?? document.body}
            />
          </div>
        )}

        <Button type="primary" className="chart-filter__apply" onClick={apply}>
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
      onOpenChange={setOpen}
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
