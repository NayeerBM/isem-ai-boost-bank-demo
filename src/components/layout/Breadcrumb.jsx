import "./Breadcrumb.scss";

export default function Breadcrumb({ section, page }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {`${section} > `}
      <span className="breadcrumb-current" aria-current="page">
        {page}
      </span>
    </nav>
  );
}
