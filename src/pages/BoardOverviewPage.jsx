import { useMemo, useState } from "react";
import OverviewSection from "../components/dashboard/OverviewSection";
import SummaryBarChart from "../components/dashboard/SummaryBarChart";
import RiskTrendChart from "../components/dashboard/RiskTrendChart";
import RiskAppetiteStatus from "../components/dashboard/RiskAppetiteStatus";
import {
  DEFAULT_GLOBAL_FILTER,
  buildAppetite,
  buildKpis,
} from "./boardOverviewData";
import "./BoardOverviewPage.scss";

export default function BoardOverviewPage() {
  const [filter, setFilter] = useState(DEFAULT_GLOBAL_FILTER);

  const kpis = useMemo(() => buildKpis(filter), [filter]);
  const appetite = useMemo(() => buildAppetite(filter, kpis), [filter, kpis]);

  return (
    <main className="page">
      <div className="board-overview">
        <OverviewSection
          filter={filter}
          kpis={kpis}
          onFilterChange={setFilter}
        />

        <div className="board-overview-charts">
          <SummaryBarChart
            title="Fraud Loss"
            metric="fraudLoss"
            globalFilter={filter}
          />
          <SummaryBarChart
            title="Fraud Prevented"
            metric="fraudPrevented"
            globalFilter={filter}
          />
        </div>

        <RiskTrendChart globalFilter={filter} />

        <RiskAppetiteStatus items={appetite} />
      </div>
    </main>
  );
}
