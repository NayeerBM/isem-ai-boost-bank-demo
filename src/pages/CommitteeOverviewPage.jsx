import { useMemo, useState } from "react";
import CommitteeOverviewSection from "../components/committee/CommitteeOverviewSection";
import { DEFAULT_GLOBAL_FILTER, buildKpiRows } from "./committeeOverviewData";
import "./CommitteeOverviewPage.scss";

export default function CommitteeOverviewPage() {
  const [filter, setFilter] = useState(DEFAULT_GLOBAL_FILTER);
  const kpiRows = useMemo(() => buildKpiRows(filter), [filter]);

  return (
    <main className="page">
      <div className="committee-overview">
        <CommitteeOverviewSection
          filter={filter}
          rows={kpiRows}
          onFilterChange={setFilter}
        />
      </div>
    </main>
  );
}
