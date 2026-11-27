import "./ClientRiskAppetite.scss";

export default function ClientRiskAppetite({ items }) {
  return (
    <section className="card client-appetite">
      <h3 className="card-title">Client Risk Appetite</h3>
      <div className="client-appetite-grid">
        {items.map((item) => (
          <article key={item.key} className="client-appetite-item">
            <span className="text-body">{item.title}</span>
            <span className="text-value">{item.value}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
