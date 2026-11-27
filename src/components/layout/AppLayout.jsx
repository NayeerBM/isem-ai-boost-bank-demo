import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import "./AppLayout.scss";

export default function AppLayout({ routes, currentPath, children }) {
  return (
    <div className="app-layout">
      <AppHeader homePath={routes[0].path} />
      <div className="app-layout-body">
        <Sidebar routes={routes} currentPath={currentPath} />
        <main className="app-layout-content">{children}</main>
      </div>
    </div>
  );
}
