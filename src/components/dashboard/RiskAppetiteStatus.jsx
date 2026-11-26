import "./RiskAppetiteStatus.scss";

export default function RiskAppetiteStatus({ items }) {
  return (
    <section className="card appetite">
      <h3 className="card-title">Financial Crime Risk Appetite Status</h3>
      <div className="appetite-grid">
        {items.map((item) => (
          <article key={item.key} className="appetite-item">
            <div className="appetite-item-top">
              <span className="text-body">{item.title}</span>
              <span className={`status-chip status-chip-${item.tone}`}>
                {item.status}
              </span>
            </div>
            <span className="text-value">{item.value}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
