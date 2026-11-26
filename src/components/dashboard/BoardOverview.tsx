import { useMemo, useState } from 'react';
import OverviewSection from './OverviewSection';
import SummaryBarChart from './SummaryBarChart';
import RiskTrendChart from './RiskTrendChart';
import RiskAppetiteStatus from './RiskAppetiteStatus';
import { DEFAULT_GLOBAL_FILTER, buildAppetite, buildKpis, type GlobalFilter } from '../../data/dashboardData';
import './BoardOverview.scss';

/** Dashboard > Board Overview: the content area (Figma node 87385:143569). */
export default function BoardOverview() {
  const [filter, setFilter] = useState<GlobalFilter>(DEFAULT_GLOBAL_FILTER);

  const kpis = useMemo(() => buildKpis(filter), [filter]);
  const appetite = useMemo(() => buildAppetite(filter, kpis), [filter, kpis]);

  return (
    <div className="board-overview">
      <OverviewSection filter={filter} kpis={kpis} onFilterChange={setFilter} />

      <div className="board-overview__charts">
        <SummaryBarChart title="Fraud Loss" metric="fraudLoss" global={filter} />
        <SummaryBarChart title="Fraud Prevented" metric="fraudPrevented" global={filter} />
      </div>

      <RiskTrendChart global={filter} />

      <RiskAppetiteStatus items={appetite} />
    </div>
  );
}
