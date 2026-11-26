import "./ChartCard.scss";

export default function ChartCard({
  title,
  subtitle,
  badge,
  filter,
  className = "",
  children,
}) {
  return (
    <section className={`card chart-card ${className}`.trim()}>
      <header className="chart-card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          <p className="chart-card-subtitle text-body">
            {subtitle}
            {badge && <span className="chart-card-badge">{badge}</span>}
          </p>
        </div>
        {filter}
      </header>
      {children}
    </section>
  );
}
