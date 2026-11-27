# iSEM.ai Dashboards

Dashboard > Board Overview and Dashboard > Committee Overview content areas from the iSEM.ai V2.0 Figma file, built with React, Ant Design 4, Recharts, Moment and Sass. All numbers are dummy data generated per filter.

## Run

```
npm install
npm run dev
```

Open http://localhost:5173.

| Page               | URL                                        |
| ------------------ | ------------------------------------------ |
| Board Overview     | http://localhost:5173/#/board-overview     |
| Committee Overview | http://localhost:5173/#/committee-overview |

Switch pages from the sidebar (Dashboard group) or by URL. The header shows only the logo, and the sidebar only has the Dashboard group with these two pages.

## Scripts

| Command           | Purpose                      |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start the dev server         |
| `npm run build`   | Build for production         |
| `npm run lint`    | Run ESLint                   |
| `npm run preview` | Preview the production build |

## Structure

```
src/
  App.jsx                          hash routes for Board and Committee
  AppLayout.jsx/.scss              shared header, sidebar and breadcrumb
  Dashboard/
    BoardOverviewCharts/           Board layout, chart JSX/SCSS, data and CSV rows
    CommitteeOverviewCharts/       Committee layout, chart JSX/SCSS, data and CSV rows
    DashboardChartsFilterPopover/  shared filter UI, options and period handling
  hooks/                           element width, reduced motion
  utils/                           seeded random numbers, currency formatting, CSV download
  styles/                          Sass breakpoints and Recharts axis styling
  index.scss                       design tokens and shared classes
```

## Filters

### Board Overview

- Overview: Filter Quarter (Q1–Q4 or All Quarters) and Filter Year update the KPI cards, the risk appetite status and highlight the selected quarter in the bar charts.
- Each chart has a filter popover: Duration (Quarterly, Yearly, Monthly, Weekly) with Year and Month where relevant.
- Export (CSV download) is commented out for now; uncomment it in the page file to enable it again.

### Committee Overview

- Overview: Filter Quarter and Filter Year update the 10 KPI cards (AML Transaction Monitoring, AML Watchlist Monitoring, STR Reported), the Client Risk Appetite cards and the period used by the charts.
- Red Flag Inflow vs Case Investigation Completion: Duration (default Weekly) with Year and Month; the points follow the chosen periods.
- AML Investigation Backlogs and Top 10 Rules Generating Red Flags: Duration picks one period (shown in the badge next to the subtitle); the rules chart keeps the 10 rules with the most red flags.
- Export (CSV download) is commented out for now; uncomment it in the page file to enable it again.
