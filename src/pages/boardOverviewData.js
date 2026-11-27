import { seededNumber } from "../utils/seededRandom";
import { formatRM } from "../utils/formatValue";

import {
  buildPeriods,
  describeGlobalFilter,
  DURATION_SUMMARY,
  QUARTER_OPTIONS,
} from "../Dashboard/DashboardChartsFilterPopover/dashboardChartPeriods";

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
