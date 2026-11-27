import { Fragment } from "react";
import "./Breadcrumb.scss";

export default function Breadcrumb({ items }) {
  const lastIndex = items.length - 1;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <Fragment key={item}>
          {index > 0 && " > "}
          {index === lastIndex ? (
            <span className="breadcrumb-current" aria-current="page">
              {item}
            </span>
          ) : (
            item
          )}
        </Fragment>
      ))}
    </nav>
  );
}
