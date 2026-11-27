import BoardOverviewPage from "./pages/BoardOverviewPage";
import CommitteeOverviewPage from "./pages/CommitteeOverviewPage";

export const ROUTES = [
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

export const DEFAULT_ROUTE = ROUTES[0];

export function findRoute(hash) {
  return ROUTES.find((route) => route.path === hash) ?? DEFAULT_ROUTE;
}
