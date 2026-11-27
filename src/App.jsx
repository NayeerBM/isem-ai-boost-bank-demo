import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import BoardOverviewPage from "./pages/BoardOverviewPage";
import CommitteeOverviewPage from "./pages/CommitteeOverviewPage";

const ROUTES = [
  {
    path: "#/board-overview",
    title: "Board Overview",
    Page: BoardOverviewPage,
  },
  {
    path: "#/committee-overview",
    title: "Committee Overview",
    Page: CommitteeOverviewPage,
  },
];

function findRoute(hash) {
  return ROUTES.find((route) => route.path === hash) ?? ROUTES[0];
}

export default function App() {
  const [route, setRoute] = useState(() => findRoute(window.location.hash));
  const { title, Page } = route;

  useEffect(() => {
    const handleHashChange = () => setRoute(findRoute(window.location.hash));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.title = `iSEM.ai - ${title}`;
  }, [title]);

  return (
    <AppLayout routes={ROUTES} currentPath={route.path}>
      <Page />
    </AppLayout>
  );
}
