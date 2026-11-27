import "./Breadcrumb.scss";

export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.join(" > ")}
    </nav>
  );
}
