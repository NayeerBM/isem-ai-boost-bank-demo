import Sidebar from "./Sidebar";
import "./AppLayout.scss";

export default function AppLayout({ routes, currentPath, children }) {
  return (
    <div className="app-layout">
      <Sidebar routes={routes} currentPath={currentPath} />
      <div className="app-layout-content">{children}</div>
    </div>
  );
}
