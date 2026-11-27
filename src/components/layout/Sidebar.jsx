import { useState } from "react";
import homeIcon from "../../assets/icons/home.svg";
import chevronUp from "../../assets/icons/chevron-up-white.svg";
import "./Sidebar.scss";

export default function Sidebar({ routes, currentPath }) {
  const [open, setOpen] = useState(true);

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <button
        type="button"
        className="sidebar-group"
        aria-expanded={open}
        aria-controls="sidebar-dashboard"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sidebar-group-label">
          <img src={homeIcon} alt="" width={20} height={20} />
          Dashboard
        </span>
        <img
          className={`sidebar-chevron${open ? "" : " sidebar-chevron-closed"}`}
          src={chevronUp}
          alt=""
          width={14}
          height={14}
        />
      </button>

      {open && (
        <ul id="sidebar-dashboard" className="sidebar-list">
          {routes.map((route) => {
            const active = route.path === currentPath;
            return (
              <li key={route.path}>
                <a
                  href={route.path}
                  className={`sidebar-link${active ? " sidebar-link-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {route.title}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}
