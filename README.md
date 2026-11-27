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
  App.jsx                          hash routes for the two pages, wrapped in the layout
  components/layout/               header (logo), sidebar (Dashboard group) and page layout
  pages/BoardOverviewPage.jsx      Board page layout and global Quarter/Year filter
  pages/boardOverviewData.js       Board dummy data, shared filter options and period builder
  pages/CommitteeOverviewPage.jsx  Committee page layout, filters and CSV export
  pages/committeeOverviewData.js   Committee dummy data and export rows
  components/dashboard/            Board sections and shared chart card, filter popover, tooltip
  components/committee/            Committee KPI section, charts and client risk appetite
  hooks/                           element width, reduced motion
  utils/                           seeded random numbers, currency format, CSV download
  styles/_breakpoints.scss         Sass breakpoints
  index.scss                       design tokens and shared classes
```

## Filters

### Board Overview

- Overview: Filter Quarter (Q1–Q4 or All Quarters) and Filter Year update the KPI cards, the risk appetite status and highlight the selected quarter in the bar charts.
- Each chart has a filter popover: Duration (Quarterly, Yearly, Monthly, Weekly, Daily) with Year and Month where relevant. The bar charts also sort by value.

### Committee Overview

- Overview: Filter Quarter and Filter Year update the 10 KPI cards (AML Transaction Monitoring, AML Watchlist Monitoring, STR Reported), the Client Risk Appetite cards and the period used by the charts.
- Red Flag Inflow vs Case Investigation Completion: Duration (default Weekly) with Year and Month; the points follow the chosen periods.
- AML Investigation Backlogs and Top 10 Rules Generating Red Flags: Duration picks one period (shown in the badge next to the subtitle); the rules chart keeps the 10 rules with the most red flags.
- Export (top-right) downloads the data currently shown as CSV.
