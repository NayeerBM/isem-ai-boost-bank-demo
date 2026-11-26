# iSEM.ai Board Overview

Dashboard > Board Overview content area from the iSEM.ai V2.0 Figma file, built with React, Ant Design 4, Recharts, Moment and Sass. All numbers are dummy data generated per filter.

## Run

```
npm install
npm run dev
```

Open http://localhost:5173.

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
  pages/BoardOverviewPage.jsx    page layout and global Quarter/Year filter
  pages/boardOverviewData.js     dummy data, filter options and builders
  components/dashboard/          overview, charts, filter popover, risk appetite
  hooks/                         element width, reduced motion
  utils/                         seeded random numbers, currency format
  styles/_breakpoints.scss       Sass breakpoints
  index.scss                     design tokens and shared classes
```

## Filters

- Overview: Filter Quarter (Q1–Q4 or All Quarters) and Filter Year update the KPI cards, the risk appetite status and highlight the selected quarter in the bar charts.
- Each chart has a filter popover: Duration (Quarterly, Yearly, Monthly, Weekly, Daily) with Year and Month where relevant. The bar charts also sort by value.
