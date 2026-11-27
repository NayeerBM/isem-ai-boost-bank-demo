import { useMemo, useState } from "react";
import ExportButton from "../components/dashboard/ExportButton";
import OverviewSection from "../components/dashboard/OverviewSection";
import SummaryBarChart from "../components/dashboard/SummaryBarChart";
import RiskTrendChart from "../components/dashboard/RiskTrendChart";
import RiskAppetiteStatus from "../components/dashboard/RiskAppetiteStatus";
import { downloadCsv } from "../utils/downloadCsv";
import {
  DEFAULT_GLOBAL_FILTER,
  buildAppetite,
  buildExportRows,
  buildKpis,
  buildSeries,
  defaultChartFilter,
  exportFileName,
  sortSeries,
  withGlobalYear,
} from "./boardOverviewData";
import "./BoardOverviewPage.scss";

function defaultChartFilters(globalFilter) {
  return {
    fraudLoss: defaultChartFilter(globalFilter),
    fraudPrevented: defaultChartFilter(globalFilter),
    trend: defaultChartFilter(globalFilter),
  };
}

function buildBarChart(chartFilter, globalFilter, metric) {
  const filter = withGlobalYear(chartFilter, globalFilter);
  const data = sortSeries(
    buildSeries(filter, globalFilter),
    metric,
    filter.sort,
  );
  return { filter, data };
}

export default function BoardOverviewPage() {
  const [filter, setFilter] = useState(DEFAULT_GLOBAL_FILTER);
  const [chartFilters, setChartFilters] = useState(() =>
    defaultChartFilters(DEFAULT_GLOBAL_FILTER),
  );

  const resetFilters = defaultChartFilters(filter);
  const setChartFilter = (key) => (value) =>
    setChartFilters((prev) => ({ ...prev, [key]: value }));

  const kpis = useMemo(() => buildKpis(filter), [filter]);
  const appetite = useMemo(() => buildAppetite(filter, kpis), [filter, kpis]);

  const fraudLoss = useMemo(
    () => buildBarChart(chartFilters.fraudLoss, filter, "fraudLoss"),
    [chartFilters.fraudLoss, filter],
  );
  const fraudPrevented = useMemo(
    () => buildBarChart(chartFilters.fraudPrevented, filter, "fraudPrevented"),
    [chartFilters.fraudPrevented, filter],
  );
  const trend = useMemo(() => {
    const applied = withGlobalYear(chartFilters.trend, filter);
    return { filter: applied, data: buildSeries(applied, filter) };
  }, [chartFilters.trend, filter]);

  const handleExport = () => {
    downloadCsv(
      exportFileName("board-overview", filter),
      buildExportRows({
        globalFilter: filter,
        kpis,
        fraudLoss,
        fraudPrevented,
        trend,
        appetite,
      }),
    );
  };

  return (
    <main className="page">
      <div className="board-overview">
        <ExportButton onClick={handleExport} />

        <OverviewSection
          filter={filter}
          kpis={kpis}
          onFilterChange={setFilter}
        />

        <div className="board-overview-charts">
          <SummaryBarChart
            title="Fraud Loss"
            metric="fraudLoss"
            filter={fraudLoss.filter}
            resetValue={resetFilters.fraudLoss}
            onFilterChange={setChartFilter("fraudLoss")}
            data={fraudLoss.data}
          />
          <SummaryBarChart
            title="Fraud Prevented"
            metric="fraudPrevented"
            filter={fraudPrevented.filter}
            resetValue={resetFilters.fraudPrevented}
            onFilterChange={setChartFilter("fraudPrevented")}
            data={fraudPrevented.data}
          />
        </div>

        <RiskTrendChart
          filter={trend.filter}
          resetValue={resetFilters.trend}
          onFilterChange={setChartFilter("trend")}
          data={trend.data}
        />

        <RiskAppetiteStatus items={appetite} />
      </div>
    </main>
  );
}
