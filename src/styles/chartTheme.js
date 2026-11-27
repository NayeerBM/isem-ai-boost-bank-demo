import { createElement, Fragment } from "react";

export const GRID_COLOR = "#d9d9d9";

export const AXIS_TICK = {
  fill: "#7f7f7f",
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: 0.4,
  fontFamily: "Manrope, sans-serif",
};

export const Y_AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: AXIS_TICK,
  width: 40,
  tickMargin: 10,
};

export const X_AXIS_PROPS = {
  dataKey: "label",
  axisLine: false,
  tickLine: false,
  tick: AXIS_TICK,
  tickMargin: 12,
  interval: 0,
};

export const CHART_TOOLTIP_PROPS = {
  wrapperClassName: "chart-tooltip",
  labelClassName: "chart-tooltip-label",
  contentStyle: {
    padding: "var(--space-2) 10px",
    backgroundColor: "var(--color-tooltip)",
    border: 0,
    whiteSpace: "normal",
  },
  labelStyle: { marginBottom: "var(--space-1)" },
  itemStyle: { padding: 0, color: "inherit" },
  formatter(value, name, { color, payload }) {
    return [
      createElement(
        Fragment,
        null,
        createElement("span", {
          className: "chart-tooltip-dot",
          style: { background: color ?? payload?.fill },
        }),
        createElement("span", null, name),
        createElement("strong", null, value),
      ),
      null,
    ];
  },
};
