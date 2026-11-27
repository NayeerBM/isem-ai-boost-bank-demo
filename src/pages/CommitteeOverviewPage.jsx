import { useMemo, useState } from "react";
import { Tooltip } from "antd";
import CommitteeOverviewSection from "../components/committee/CommitteeOverviewSection";
import InflowCompletionChart from "../components/committee/InflowCompletionChart";
import BacklogChart from "../components/committee/BacklogChart";
import TopRulesChart from "../components/committee/TopRulesChart";
import ClientRiskAppetite from "../components/committee/ClientRiskAppetite";
import shareIcon from "../assets/icons/share.svg";
import { downloadCsv } from "../utils/downloadCsv";
import { defaultChartFilter } from "./boardOverviewData";
import {
  DEFAULT_GLOBAL_FILTER,
  buildAppetite,
  buildExportRows,
  buildBacklog,
  buildTopRules,
  buildInflowAxis,
  buildInflowSeries,
  buildKpiRows,
  defaultInflowFilter,
  withGlobalYear,
} from "./committeeOverviewData";
import "./CommitteeOverviewPage.scss";

function defaultChartFilters(globalFilter) {
  return {
    inflow: defaultInflowFilter(globalFilter),
    backlog: defaultChartFilter(globalFilter),
    rules: defaultChartFilter(globalFilter),
  };
}

export default function CommitteeOverviewPage() {
  const [filter, setFilter] = useState(DEFAULT_GLOBAL_FILTER);
  const [chartFilters, setChartFilters] = useState(() =>
    defaultChartFilters(DEFAULT_GLOBAL_FILTER),
  );

  const resetFilters = defaultChartFilters(filter);
  const setChartFilter = (key) => (value) =>
    setChartFilters((prev) => ({ ...prev, [key]: value }));

  const kpiRows = useMemo(() => buildKpiRows(filter), [filter]);

  const inflow = useMemo(() => {
    const applied = withGlobalYear(chartFilters.inflow, filter);
    const data = buildInflowSeries(applied, filter);
    return {
      filter: applied,
      data,
      axis: buildInflowAxis(data, applied.duration),
    };
  }, [chartFilters.inflow, filter]);

  const backlog = useMemo(() => {
    const applied = withGlobalYear(chartFilters.backlog, filter);
    return { filter: applied, ...buildBacklog(applied, filter) };
  }, [chartFilters.backlog, filter]);

  const rules = useMemo(() => {
    const applied = withGlobalYear(chartFilters.rules, filter);
    return { filter: applied, ...buildTopRules(applied, filter) };
  }, [chartFilters.rules, filter]);

  const appetite = useMemo(() => buildAppetite(filter), [filter]);

  const handleExport = () => {
    const period = filter.quarter
      ? `${filter.year}-Q${filter.quarter}`
      : String(filter.year);
    downloadCsv(
      `committee-overview-${period}.csv`,
      buildExportRows({
        globalFilter: filter,
        kpiRows,
        inflow,
        backlog,
        rules,
        appetite,
      }),
    );
  };

  return (
    <main className="page">
      <div className="committee-overview">
        <div className="committee-overview-toolbar">
          <Tooltip title="Export CSV" placement="left">
            <button
              type="button"
              className="icon-button"
              onClick={handleExport}
              aria-label="Export dashboard data as CSV"
            >
              <img src={shareIcon} alt="" width={20} height={20} />
            </button>
          </Tooltip>
        </div>

        <CommitteeOverviewSection
          filter={filter}
          rows={kpiRows}
          onFilterChange={setFilter}
        />

        <InflowCompletionChart
          filter={inflow.filter}
          resetValue={resetFilters.inflow}
          onFilterChange={setChartFilter("inflow")}
          data={inflow.data}
          axis={inflow.axis}
        />

        <BacklogChart
          filter={backlog.filter}
          resetValue={resetFilters.backlog}
          onFilterChange={setChartFilter("backlog")}
          period={backlog.period}
          data={backlog.data}
          axis={backlog.axis}
        />

        <TopRulesChart
          filter={rules.filter}
          resetValue={resetFilters.rules}
          onFilterChange={setChartFilter("rules")}
          period={rules.period}
          data={rules.data}
          axis={rules.axis}
        />

        <ClientRiskAppetite items={appetite} />
      </div>
    </main>
  );
}
