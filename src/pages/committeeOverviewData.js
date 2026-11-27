import moment from "moment";
import { seededNumber } from "../utils/seededRandom";
import {
  QUARTER_OPTIONS,
  buildAxis,
  buildPeriods,
  defaultChartFilter,
} from "./boardOverviewData";

export { DEFAULT_GLOBAL_FILTER, withGlobalYear } from "./boardOverviewData";

export const KPI_GROUPS = [
  {
    key: "transaction",
    caption: "AML Transaction Monitoring",
    tone: "transaction",
    metrics: [
      { key: "redFlags", label: "red flags", icon: "flag", range: [60, 110] },
      {
        key: "openCases",
        label: "open cases",
        icon: "folder",
        range: [40, 80],
      },
      {
        key: "falsePositive",
        label: "false positive cases",
        icon: "plus",
        range: [15, 35],
      },
      { key: "muleCases", label: "mule cases", icon: "shield", range: [8, 20] },
      {
        key: "overdue",
        label: "overdue investigation",
        icon: "clock",
        range: [1, 5],
      },
    ],
  },
  {
    key: "watchlist",
    caption: "AML Watchlist Monitoring",
    tone: "watchlist",
    metrics: [
      { key: "redFlags", label: "red flags", icon: "flag", range: [30, 70] },
      {
        key: "openCases",
        label: "open cases",
        icon: "folder",
        range: [20, 40],
      },
      {
        key: "falsePositive",
        label: "false positive cases",
        icon: "plus",
        range: [10, 25],
      },
      {
        key: "overdue",
        label: "overdue investigation",
        icon: "clock",
        range: [8, 20],
      },
    ],
  },
];

export const STR_METRIC = {
  key: "strReported",
  label: "reports",
  caption: "STR Reported",
  range: [10, 25],
};

function quarterValue(seed, year, quarter, [min, max]) {
  return seededNumber(`${seed}-${year}-Q${quarter}`, min, max);
}

function periodValue(seed, { year, quarter }, range) {
  const quarters = quarter ? [quarter] : QUARTER_OPTIONS;
  return quarters.reduce(
    (total, q) => total + quarterValue(seed, year, q, range),
    0,
  );
}

export function buildKpiRows(globalFilter) {
  const rows = KPI_GROUPS.map((group) => ({
    key: group.key,
    tone: group.tone,
    cards: group.metrics.map((metric) => ({
      key: `${group.key}-${metric.key}`,
      label: metric.label,
      caption: group.caption,
      icon: metric.icon,
      value: periodValue(
        `${group.key}-${metric.key}`,
        globalFilter,
        metric.range,
      ),
    })),
  }));

  rows[1].cards.push({
    key: STR_METRIC.key,
    label: STR_METRIC.label,
    caption: STR_METRIC.caption,
    tone: "report",
    value: periodValue(STR_METRIC.key, globalFilter, STR_METRIC.range),
  });

  return rows;
}

export function buildAppetite(globalFilter) {
  const seed = `${globalFilter.year}-${globalFilter.quarter ?? "all"}`;
  return [
    {
      key: "conversion",
      title: "Conversion to High-Risk Customer",
      value: `${seededNumber(`conversion-${seed}`, 12, 34)}%`,
    },
    {
      key: "onboard",
      title: "High-Risk Customer Onboard",
      value: String(periodValue("onboard", globalFilter, [50, 110])),
    },
  ];
}

/* Red Flag Inflow vs Case Investigation Completion */

export const INFLOW_SERIES = [
  { key: "inflow", name: "Red Flag Inflow", color: "#e53935" },
  { key: "completion", name: "Case Completion", color: "#1a7d71" },
];

const INFLOW_RANGE = {
  yearly: [1200, 2800],
  quarterly: [300, 700],
  monthly: [100, 240],
  weekly: [25, 60],
  daily: [3, 12],
};

export function defaultInflowFilter(globalFilter) {
  return { ...defaultChartFilter(globalFilter), duration: "weekly" };
}

export function buildInflowSeries(filter, globalFilter) {
  const [min, max] = INFLOW_RANGE[filter.duration];
  return buildPeriods(filter, globalFilter).map((period) => {
    const inflow = seededNumber(`inflow-${period.key}`, min, max);
    const ratio = seededNumber(`completion-${period.key}`, 60, 95) / 100;
    return {
      key: period.key,
      label: period.label,
      highlighted: period.highlighted,
      inflow,
      completion: Math.round(inflow * ratio),
    };
  });
}

export function buildInflowAxis(series, duration) {
  const max = Math.max(
    ...series.map((point) => Math.max(point.inflow, point.completion)),
  );
  return buildAxis(max, duration);
}

/* Snapshot charts: one period chosen by the chart filter */

const WINDOW_SCALE = {
  daily: 1 / 20,
  weekly: 1 / 4,
  monthly: 1,
  quarter: 3,
  year: 12,
};

export function describeWindow(filter, globalFilter) {
  const { year, quarter } = globalFilter;
  const month = moment().month();

  if (filter.duration === "quarterly") {
    return quarter
      ? {
          key: `${year}-Q${quarter}`,
          label: `Q${quarter} ${year}`,
          scale: "quarter",
        }
      : { key: `${year}`, label: `${year}`, scale: "year" };
  }
  if (filter.duration === "yearly") {
    return { key: `${year}`, label: `${year}`, scale: "year" };
  }
  if (filter.duration === "monthly") {
    return {
      key: `${filter.year}-M${month}`,
      label: moment({ year: filter.year, month }).format("MMM YYYY"),
      scale: "monthly",
    };
  }
  if (filter.duration === "weekly") {
    return {
      key: `${filter.year}-M${filter.month}-W1`,
      label: `W1 ${moment({ year: filter.year, month: filter.month }).format("MMM YYYY")}`,
      scale: "weekly",
    };
  }
  const today = moment();
  return {
    key: `D${today.format("YYYY-MM-DD")}`,
    label: today.format("DD MMM YYYY"),
    scale: "daily",
  };
}

function scaledValue(seed, window, [min, max]) {
  const scale = WINDOW_SCALE[window.scale];
  return Math.max(
    1,
    Math.round(seededNumber(`${seed}-${window.key}`, min, max) * scale),
  );
}

export const BACKLOG_BUCKETS = [
  { key: "le7", label: "≤ 7 Days", color: "#09285f" },
  { key: "8to14", label: "8-14 Days", color: "#264886" },
  { key: "15to21", label: "15-21 Days", color: "#8eabe0" },
  { key: "22to30", label: "22-30 Days", color: "#bfcfeb" },
  { key: "gt30", label: "> 30 Days", color: "#d5e4ff" },
];

export function buildBacklog(filter, globalFilter) {
  const window = describeWindow(filter, globalFilter);
  const data = BACKLOG_BUCKETS.map((bucket) => ({
    ...bucket,
    cases: scaledValue(`backlog-${bucket.key}`, window, [8, 30]),
  }));
  const axis = buildAxis(
    Math.max(...data.map((point) => point.cases)),
    "quarterly",
  );
  return { window, data, axis };
}

export const RULE_COLORS = [
  "#09285f",
  "#203d71",
  "#264886",
  "#4d6794",
  "#647ca6",
  "#8eabe0",
  "#91a5ca",
  "#a8badb",
  "#becfed",
  "#d5e4ff",
];

export const RULES = [
  "Rapid movement of funds in and out of account",
  "Structuring below reporting threshold",
  "High-risk jurisdiction transfer",
  "Dormant account reactivation",
  "Multiple accounts sharing one device",
  "Large cash deposit",
  "Round-amount transfers",
  "Third-party cash deposits",
  "Unusual cross-border wire",
  "Many-to-one transfers",
  "Sanctions name similarity",
  "New account high-value inflow",
];

function niceAxis(maxValue) {
  const raw = Math.max(maxValue, 10);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(
    (s) => s * magnitude >= raw,
  );
  const max = step * magnitude;
  const ticks = Array.from(
    { length: 11 },
    (_, index) => Math.round(((max * index) / 10) * 100) / 100,
  );
  return { max, ticks };
}

export function buildTopRules(filter, globalFilter) {
  const window = describeWindow(filter, globalFilter);
  const all = RULES.map((rule, index) => ({
    key: `rule-${index}`,
    rule,
    redFlags: scaledValue(`rule-${index}`, window, [8, 42]),
  }));
  const total = all.reduce((sum, item) => sum + item.redFlags, 0);
  const data = [...all]
    .sort((a, b) => b.redFlags - a.redFlags)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      color: RULE_COLORS[index],
      share: Math.round((item.redFlags / total) * 1000) / 10,
    }));
  const axis = niceAxis(data[0].redFlags);
  return { window, data, axis, total };
}
