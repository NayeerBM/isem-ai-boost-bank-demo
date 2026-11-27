import { useEffect, useState } from "react";
import BoardOverviewPage from "./pages/BoardOverviewPage";
import CommitteeOverviewPage from "./pages/CommitteeOverviewPage";

const ROUTES = {
  "#/board-overview": { title: "Board Overview", Page: BoardOverviewPage },
  "#/committee-overview": {
    title: "Committee Overview",
    Page: CommitteeOverviewPage,
  },
};

const DEFAULT_ROUTE = "#/board-overview";

function currentRoute() {
  return ROUTES[window.location.hash] ? window.location.hash : DEFAULT_ROUTE;
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const { title, Page } = ROUTES[route];

  useEffect(() => {
    const handleHashChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    document.title = `iSEM.ai - ${title}`;
  }, [title]);

  return <Page />;
}
