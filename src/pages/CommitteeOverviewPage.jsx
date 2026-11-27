import { useMemo, useState } from "react";
import CommitteeOverviewSection from "../components/committee/CommitteeOverviewSection";
import InflowCompletionChart from "../components/committee/InflowCompletionChart";
import BacklogChart from "../components/committee/BacklogChart";
import { defaultChartFilter } from "./boardOverviewData";
import {
  DEFAULT_GLOBAL_FILTER,
  buildBacklog,
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

  return (
    <main className="page">
      <div className="committee-overview">
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
      </div>
    </main>
  );
}
