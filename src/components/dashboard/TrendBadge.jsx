import arrowIncrease from "../../assets/icons/arrow-increase.svg";
import arrowDecrease from "../../assets/icons/arrow-decrease.svg";
import "./TrendBadge.scss";

export default function TrendBadge({ value, suffix = "" }) {
  if (value === 0) return null;
  const isUp = value > 0;

  return (
    <span
      className={`trend-badge ${isUp ? "trend-badge-up" : "trend-badge-down"}`}
    >
      <img
        src={isUp ? arrowIncrease : arrowDecrease}
        alt={isUp ? "Increase" : "Decrease"}
        width={17.7143}
        height={10}
      />
      {isUp ? "" : "-"}
      {Math.abs(value)}
      {suffix}
    </span>
  );
}
