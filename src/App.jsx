import { useEffect, useState } from "react";
import AppLayout from "./components/layout/AppLayout";
import { ROUTES, findRoute } from "./routes";

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
