import AppHeader from "./AppHeader";
import Breadcrumb from "./Breadcrumb";
import Sidebar from "./Sidebar";
import "./AppLayout.scss";

export default function AppLayout({ routes, currentPath, children }) {
  const current = routes.find((route) => route.path === currentPath);

  return (
    <div className="app-layout">
      <AppHeader homePath={routes[0].path} />
      <div className="app-layout-body">
        <Sidebar routes={routes} currentPath={currentPath} />
        <main className="app-layout-content">
          <div className="app-layout-breadcrumb">
            <Breadcrumb section="Dashboard" page={current.title} />
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
