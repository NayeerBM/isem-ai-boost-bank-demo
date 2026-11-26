export const BAR_COLORS = ["#09285f", "#5273b0", "#8eabe0", "#d5e4ff"];

export const LINE_SERIES = [
  { key: "fraudLoss", name: "Fraud Loss", color: "#e53935" },
  { key: "fraudPrevented", name: "Fraud Prevented", color: "#1a7d71" },
];

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
