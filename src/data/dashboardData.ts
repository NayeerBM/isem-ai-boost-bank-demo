import moment from 'moment';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Quarter = 1 | 2 | 3 | 4;
export type Duration = 'quarterly' | 'yearly' | 'monthly' | 'weekly' | 'daily';
export type SortOrder = 'default' | 'desc' | 'asc';
export type Metric = 'fraudLoss' | 'fraudPrevented';

export interface GlobalFilter {
  year: number;
  quarter: Quarter | null; // null = whole year
}

export interface ChartFilter {
  duration: Duration;
  year: number; // used by monthly + weekly
  month: number; // 0-11, used by weekly
  sort: SortOrder;
}

export interface SeriesPoint {
  key: string;
  label: string;
  fraudLoss: number;
  fraudPrevented: number;
  /** true when the point belongs to the globally selected quarter */
  highlighted: boolean;
}

export interface OverviewKpis {
  fraudLossesAmount: number;
  fraudLossesChangePct: number;
  residualAmlRisk: number;
  fraudPrevented: number;
  amlBreach: number;
  fraudBreach: number;
  incidents: number;
  incidentsChange: number;
  strReported: number;
}

export type ChipTone = 'danger' | 'success';

export interface AppetiteItem {
  key: string;
  title: string;
  value: string;
  status: string;
  tone: ChipTone;
}

/* ------------------------------------------------------------------ */
/*  Deterministic pseudo-random numbers                                */
/*  Same filter → same numbers, so the dummy data feels "real".        */
/* ------------------------------------------------------------------ */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Returns a stable number in [min, max] for the given seed. */
function seeded(seed: string, min: number, max: number): number {
  let t = hashString(seed) + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return Math.round(min + r * (max - min));
}

/* ------------------------------------------------------------------ */
/*  Filter options                                                     */
/* ------------------------------------------------------------------ */

export const CURRENT_YEAR = moment().year();

export const YEAR_OPTIONS: number[] = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export const QUARTER_OPTIONS: Quarter[] = [1, 2, 3, 4];

export const MONTH_OPTIONS = moment.months().map((name, index) => ({ label: name, value: index }));

export const DURATION_OPTIONS: { label: string; value: Duration }[] = [
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Daily', value: 'daily' },
];

export const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: 'Default (by period)', value: 'default' },
  { label: 'Highest to lowest', value: 'desc' },
  { label: 'Lowest to highest', value: 'asc' },
];

export const DURATION_SUMMARY_LABEL: Record<Duration, string> = {
  quarterly: 'Quarterly Summary',
  yearly: 'Yearly Summary',
  monthly: 'Monthly Summary',
  weekly: 'Weekly Summary',
  daily: 'Daily Summary',
};

/** Minimum axis scale per duration; quarterly matches the 0–100 axis in the design. */
export const AXIS_FLOOR: Record<Duration, number> = {
  quarterly: 100,
  yearly: 4,
  monthly: 4,
  weekly: 4,
  daily: 4,
};

export const DEFAULT_GLOBAL_FILTER: GlobalFilter = { year: CURRENT_YEAR, quarter: null };

export function defaultChartFilter(global: GlobalFilter): ChartFilter {
  return { duration: 'quarterly', year: global.year, month: moment().month(), sort: 'default' };
}

/* ------------------------------------------------------------------ */
/*  Time series                                                        */
/* ------------------------------------------------------------------ */

function point(key: string, label: string, min: number, max: number, highlighted = false): SeriesPoint {
  const loss = seeded(`loss-${key}`, min, max);
  // Prevented tends to sit above loss, like in the design.
  const prevented = Math.min(max + Math.round(max * 0.2), loss + seeded(`prev-${key}`, 2, Math.max(4, Math.round(max * 0.35))));
  return { key, label, fraudLoss: loss, fraudPrevented: prevented, highlighted };
}

function quarterOfMonth(month: number): Quarter {
  return (Math.floor(month / 3) + 1) as Quarter;
}

/**
 * Builds the series for a chart. The number of points changes with the
 * duration (4 quarters, 5 years, 12 months, 4-6 weeks, 14 days) so the
 * effect of a filter is obvious.
 */
export function buildSeries(filter: ChartFilter, global: GlobalFilter): SeriesPoint[] {
  const { quarter } = global;
  let series: SeriesPoint[] = [];

  switch (filter.duration) {
    case 'quarterly':
      series = QUARTER_OPTIONS.map((q) =>
        point(`${global.year}-Q${q}`, `Q${q}`, 22, 70, quarter === q),
      );
      break;

    case 'yearly':
      series = [...YEAR_OPTIONS].reverse().map((y) =>
        point(`Y${y}`, String(y), 60, 260, y === global.year),
      );
      break;

    case 'monthly':
      series = MONTH_OPTIONS.map(({ value }) =>
        point(
          `${filter.year}-M${value}`,
          moment().month(value).format('MMM'),
          6,
          32,
          filter.year === global.year && quarter !== null && quarterOfMonth(value) === quarter,
        ),
      );
      break;

    case 'weekly': {
      const start = moment({ year: filter.year, month: filter.month, day: 1 });
      const daysInMonth = start.daysInMonth();
      const weeks = Math.ceil((daysInMonth + start.isoWeekday() - 1) / 7);
      series = Array.from({ length: weeks }, (_, i) =>
        point(`${filter.year}-M${filter.month}-W${i + 1}`, `W${i + 1}`, 1, 12),
      );
      break;
    }

    case 'daily': {
      const end = moment().startOf('day');
      series = Array.from({ length: 14 }, (_, i) => {
        const day = end.clone().subtract(13 - i, 'days');
        return point(`D${day.format('YYYY-MM-DD')}`, day.format('DD MMM'), 0, 6);
      });
      break;
    }

    default:
      series = [];
  }

  return series;
}

export function sortSeries(series: SeriesPoint[], metric: Metric, sort: SortOrder): SeriesPoint[] {
  if (sort === 'default') return series;
  const direction = sort === 'desc' ? -1 : 1;
  return [...series].sort((a, b) => (a[metric] - b[metric]) * direction);
}

/**
 * Rounds the axis maximum up to a "nice" number divisible into 4 steps.
 * `floor` keeps a minimum scale (the design shows 0–100 for quarterly data).
 */
export function niceAxis(maxValue: number, floor = 4): { max: number; ticks: number[] } {
  const raw = Math.max(maxValue, floor);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const steps = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10];
  const niceStep = steps.find((s) => s * magnitude >= raw) ?? 10;
  const max = niceStep * magnitude;
  return { max, ticks: [0, max * 0.25, max * 0.5, max * 0.75, max].map((t) => Math.round(t * 100) / 100) };
}

/* ------------------------------------------------------------------ */
/*  KPIs                                                               */
/* ------------------------------------------------------------------ */

function kpisForPeriod(year: number, quarter: Quarter): Omit<OverviewKpis, 'fraudLossesChangePct' | 'incidentsChange'> {
  const seed = `${year}-Q${quarter}`;
  return {
    fraudLossesAmount: seeded(`amount-${seed}`, 18, 48) * 1000,
    residualAmlRisk: seeded(`aml-risk-${seed}`, 12, 40),
    fraudPrevented: seeded(`prevented-${seed}`, 40, 110),
    amlBreach: seeded(`aml-breach-${seed}`, 2, 12),
    fraudBreach: seeded(`fraud-breach-${seed}`, 3, 13),
    incidents: seeded(`incidents-${seed}`, 2, 9),
    strReported: seeded(`str-${seed}`, 12, 38),
  };
}

function sumPeriods(year: number, quarters: Quarter[]) {
  return quarters
    .map((q) => kpisForPeriod(year, q))
    .reduce((acc, cur) => ({
      fraudLossesAmount: acc.fraudLossesAmount + cur.fraudLossesAmount,
      residualAmlRisk: acc.residualAmlRisk + cur.residualAmlRisk,
      fraudPrevented: acc.fraudPrevented + cur.fraudPrevented,
      amlBreach: acc.amlBreach + cur.amlBreach,
      fraudBreach: acc.fraudBreach + cur.fraudBreach,
      incidents: acc.incidents + cur.incidents,
      strReported: acc.strReported + cur.strReported,
    }));
}

export function buildKpis({ year, quarter }: GlobalFilter): OverviewKpis {
  const current = quarter ? kpisForPeriod(year, quarter) : sumPeriods(year, QUARTER_OPTIONS);
  // Compare with the previous quarter (or previous year when no quarter is chosen).
  const previous = quarter
    ? quarter === 1
      ? kpisForPeriod(year - 1, 4)
      : kpisForPeriod(year, (quarter - 1) as Quarter)
    : sumPeriods(year - 1, QUARTER_OPTIONS);

  const changePct = Math.round(
    ((current.fraudLossesAmount - previous.fraudLossesAmount) / previous.fraudLossesAmount) * 100,
  );

  return {
    ...current,
    fraudLossesChangePct: changePct,
    incidentsChange: current.incidents - previous.incidents,
  };
}

/* ------------------------------------------------------------------ */
/*  Risk appetite                                                      */
/* ------------------------------------------------------------------ */

export function formatRM(amount: number, decimals = 2): string {
  return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function buildAppetite(global: GlobalFilter, kpis: OverviewKpis): AppetiteItem[] {
  const periodFactor = global.quarter ? 1 : 4;
  const seed = `${global.year}-${global.quarter ?? 'all'}`;

  const lossLimit = 30000 * periodFactor;
  const lossStatus =
    kpis.fraudLossesAmount > lossLimit * 1.2 ? 'Critical' : kpis.fraudLossesAmount > lossLimit ? 'Breach' : 'Within Tolerance';

  const overdue = seeded(`overdue-${seed}`, 20, 120) * periodFactor;
  const overdueStatus = overdue > 60 * periodFactor ? 'Breach' : 'Within Tolerance';

  const strTimeline = seeded(`str-timeline-${seed}`, 84, 100);
  const strStatus = strTimeline >= 95 ? 'Within Timeline' : strTimeline >= 90 ? 'Breach' : 'Critical';

  const tone = (status: string): ChipTone => (status.startsWith('Within') ? 'success' : 'danger');

  return [
    { key: 'losses', title: 'Fraud Losses', value: formatRM(kpis.fraudLossesAmount, 3), status: lossStatus, tone: tone(lossStatus) },
    { key: 'overdue', title: 'Overdue Fraud Cases', value: String(overdue), status: overdueStatus, tone: tone(overdueStatus) },
    { key: 'str', title: 'STR Timeline', value: `${strTimeline}%`, status: strStatus, tone: tone(strStatus) },
  ];
}
