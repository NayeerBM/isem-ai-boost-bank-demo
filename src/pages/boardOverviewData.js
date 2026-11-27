import moment from "moment";
import { seededNumber } from "../utils/seededRandom";
import { formatRM } from "../utils/formatValue";

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

function buildPoint(key, label, min, max, highlighted = false) {
  const fraudLoss = seededNumber(`loss-${key}`, min, max);
  const extra = seededNumber(
    `prevented-${key}`,
    2,
    Math.max(4, Math.round(max * 0.35)),
  );
  const fraudPrevented = Math.min(
    max + Math.round(max * 0.2),
    fraudLoss + extra,
  );
  return { key, label, fraudLoss, fraudPrevented, highlighted };
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

const SERIES_RANGE = {
  yearly: [60, 260],
  quarterly: [22, 70],
  monthly: [6, 32],
  weekly: [1, 12],
};

export function buildSeries(filter, globalFilter) {
  const [min, max] = SERIES_RANGE[filter.duration];
  return buildPeriods(filter, globalFilter).map((period) =>
    buildPoint(period.key, period.label, min, max, period.highlighted),
  );
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

function kpisForQuarter(year, quarter) {
  const seed = `${year}-Q${quarter}`;
  return {
    fraudLossesAmount: seededNumber(`amount-${seed}`, 18, 48) * 1000,
    residualAmlRisk: seededNumber(`aml-risk-${seed}`, 12, 40),
    fraudPrevented: seededNumber(`prevented-${seed}`, 40, 110),
    amlBreach: seededNumber(`aml-breach-${seed}`, 2, 12),
    fraudBreach: seededNumber(`fraud-breach-${seed}`, 3, 13),
    incidents: seededNumber(`incidents-${seed}`, 2, 9),
    strReported: seededNumber(`str-${seed}`, 12, 38),
  };
}

function kpisForYear(year) {
  return QUARTER_OPTIONS.map((q) => kpisForQuarter(year, q)).reduce(
    (total, current) =>
      Object.fromEntries(
        Object.keys(total).map((key) => [key, total[key] + current[key]]),
      ),
  );
}

function previousPeriodKpis(year, quarter) {
  if (!quarter) return kpisForYear(year - 1);
  return quarter === 1
    ? kpisForQuarter(year - 1, 4)
    : kpisForQuarter(year, quarter - 1);
}

export function buildKpis({ year, quarter }) {
  const current = quarter ? kpisForQuarter(year, quarter) : kpisForYear(year);
  const previous = previousPeriodKpis(year, quarter);
  const lossChange =
    (current.fraudLossesAmount - previous.fraudLossesAmount) /
    previous.fraudLossesAmount;

  return {
    ...current,
    fraudLossesChangePct: Math.round(lossChange * 100),
    incidentsChange: current.incidents - previous.incidents,
  };
}

export function buildKpiCards(kpis) {
  return [
    {
      key: "aml-risk",
      value: kpis.residualAmlRisk,
      description: "Residual AML Risk",
    },
    {
      key: "prevented",
      value: kpis.fraudPrevented,
      label: "prevented",
      description: "Fraud Prevented",
    },
    {
      key: "aml-breach",
      value: kpis.amlBreach,
      label: "AML breach",
      description: "High-risk customers\nwith generated red flags",
    },
    {
      key: "fraud-breach",
      value: kpis.fraudBreach,
      label: "Fraud breach",
      description: "High-risk customers\nwith generated red flags",
    },
    {
      key: "incidents",
      value: kpis.incidents,
      label: "incidents",
      description: "Unresolved Fraud\nIncidents",
      change: kpis.incidentsChange,
    },
    {
      key: "reports",
      value: kpis.strReported,
      label: "reports",
      description: "STR Reported",
    },
  ];
}

// Statuses follow the Figma design for now: one fixed tag per card.
export function buildAppetite({ year, quarter }, kpis) {
  const periods = quarter ? 1 : 4;
  const seed = `${year}-${quarter ?? "all"}`;
  const overdue = seededNumber(`overdue-${seed}`, 20, 120) * periods;
  const strTimeline = seededNumber(`str-timeline-${seed}`, 95, 100);

  return [
    {
      key: "losses",
      title: "Fraud Losses",
      value: formatRM(kpis.fraudLossesAmount, 3),
      status: "Critical",
      tone: "danger",
    },
    {
      key: "overdue",
      title: "Overdue Fraud Cases",
      value: String(overdue),
      status: "Breach",
      tone: "danger",
    },
    {
      key: "str",
      title: "STR Timeline",
      value: `${strTimeline}%`,
      status: "Within Timeline",
      tone: "success",
    },
  ];
}

export function describeGlobalFilter({ year, quarter }) {
  return quarter ? `Q${quarter} ${year}` : `${year} (All Quarters)`;
}

export function exportFileName(page, { year, quarter }) {
  return `${page}-${quarter ? `${year}-Q${quarter}` : year}.csv`;
}

export function buildExportRows({
  globalFilter,
  kpis,
  fraudLoss,
  fraudPrevented,
  trend,
  appetite,
}) {
  const blank = [];
  const barRows = (title, chart, metric) => [
    [title, DURATION_SUMMARY[chart.filter.duration]],
    ["Period", title],
    ...chart.data.map((point) => [point.label, point[metric]]),
  ];

  return [
    ["Board Overview", describeGlobalFilter(globalFilter)],
    blank,
    ["Overview", "Description", "Value"],
    ["Fraud Losses", "", formatRM(kpis.fraudLossesAmount)],
    ["Fraud Losses change (%)", "", kpis.fraudLossesChangePct],
    ...buildKpiCards(kpis).map((card) => [
      card.label ?? card.description,
      card.label ? card.description.replace(/\n/g, " ") : "",
      card.value,
    ]),
    blank,
    ...barRows("Fraud Loss", fraudLoss, "fraudLoss"),
    blank,
    ...barRows("Fraud Prevented", fraudPrevented, "fraudPrevented"),
    blank,
    ["Financial Crime Risk Trends", DURATION_SUMMARY[trend.filter.duration]],
    ["Period", "Fraud Loss", "Fraud Prevented"],
    ...trend.data.map((point) => [
      point.label,
      point.fraudLoss,
      point.fraudPrevented,
    ]),
    blank,
    ["Financial Crime Risk Appetite Status", "Value", "Status"],
    ...appetite.map((item) => [item.title, item.value, item.status]),
  ];
}
