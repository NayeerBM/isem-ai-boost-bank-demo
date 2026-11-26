import type { AppetiteItem } from '../../data/dashboardData';

interface RiskAppetiteStatusProps {
  items: AppetiteItem[];
}

export default function RiskAppetiteStatus({ items }: RiskAppetiteStatusProps) {
  return (
    <section className="dash-card appetite">
      <h3 className="chart-card__title">Financial Crime Risk Appetite Status</h3>
      <div className="appetite__grid">
        {items.map((item) => (
          <article key={item.key} className="appetite__item">
            <div className="appetite__top">
              <span className="appetite__title">{item.title}</span>
              <span className={`status-chip status-chip--${item.tone}`}>{item.status}</span>
            </div>
            <span className="text-value">{item.value}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
