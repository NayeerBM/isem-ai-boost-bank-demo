import moment from "moment";

export const CURRENT_YEAR = moment().year();

export const YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, index) => CURRENT_YEAR - index,
);

export const QUARTER_OPTIONS = [1, 2, 3, 4];

export const MONTH_OPTIONS = moment
  .months()
  .map((name, index) => ({ label: name, value: index }));

export const DURATION_OPTIONS = [
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
];

export const DURATION_SUMMARY = {
  quarterly: "Quarterly Summary",
  yearly: "Yearly Summary",
  monthly: "Monthly Summary",
  weekly: "Weekly Summary",
};

const AXIS_FLOOR = {
  quarterly: 100,
  yearly: 4,
  monthly: 4,
  weekly: 4,
};

export const DEFAULT_GLOBAL_FILTER = { year: CURRENT_YEAR, quarter: null };

export function defaultChartFilter(globalFilter) {
  return {
    duration: "quarterly",
    year: globalFilter.year,
    month: moment().month(),
  };
}

export function withGlobalYear(filter, globalFilter) {
  return filter.duration === "quarterly"
    ? { ...filter, year: globalFilter.year }
    : filter;
}

function quarterOfMonth(month) {
  return Math.floor(month / 3) + 1;
}

export function weeksInMonth(year, month) {
  const start = moment({ year, month, day: 1 });
  return Math.ceil((start.daysInMonth() + start.isoWeekday() - 1) / 7);
}

export function buildPeriods(filter, globalFilter) {
  const { year: globalYear, quarter } = globalFilter;

  if (filter.duration === "yearly") {
    return [...YEAR_OPTIONS].reverse().map((year) => ({
      key: `Y${year}`,
      label: String(year),
      highlighted: year === globalYear,
    }));
  }

  if (filter.duration === "monthly") {
    return MONTH_OPTIONS.map(({ value }) => ({
      key: `${filter.year}-M${value}`,
      label: moment().month(value).format("MMM"),
      highlighted:
        filter.year === globalYear &&
        quarter !== null &&
        quarterOfMonth(value) === quarter,
    }));
  }

  if (filter.duration === "weekly") {
    return Array.from(
      { length: weeksInMonth(filter.year, filter.month) },
      (_, index) => ({
        key: `${filter.year}-M${filter.month}-W${index + 1}`,
        label: `W${index + 1}`,
        highlighted: false,
      }),
    );
  }

  return QUARTER_OPTIONS.map((q) => ({
    key: `${globalYear}-Q${q}`,
    label: `Q${q}`,
    highlighted: quarter === q,
  }));
}

export function buildAxis(maxValue, duration) {
  const raw = Math.max(maxValue, AXIS_FLOOR[duration]);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const steps = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => s * magnitude >= raw) ?? 10;
  const max = step * magnitude;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(
    (ratio) => Math.round(max * ratio * 100) / 100,
  );
  return { max, ticks };
}

export function describeGlobalFilter({ year, quarter }) {
  return quarter ? `Q${quarter} ${year}` : `${year} (All Quarters)`;
}

export function exportFileName(page, { year, quarter }) {
  return `${page}-${quarter ? `${year}-Q${quarter}` : year}.csv`;
}
