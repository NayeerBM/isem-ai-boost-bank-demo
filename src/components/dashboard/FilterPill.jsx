import { Dropdown } from "antd";
import chevronDown from "../../assets/icons/chevron-down-light.svg";
import "./FilterPill.scss";

const CLEAR_KEY = "all";

export default function FilterPill({
  icon,
  placeholder,
  value,
  options,
  onChange,
  clearLabel,
}) {
  const selected = options.find((option) => option.value === value);

  const items = [
    ...(clearLabel ? [{ key: CLEAR_KEY, label: clearLabel }] : []),
    ...options.map((option) => ({
      key: String(option.value),
      label: option.label,
    })),
  ];

  const handleClick = ({ key }) => {
    const option = options.find((item) => String(item.value) === key);
    onChange(option ? option.value : null);
  };

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: [value === null ? CLEAR_KEY : String(value)],
        onClick: handleClick,
      }}
      trigger={["click"]}
      placement="bottomRight"
      overlayClassName="filter-pill-menu"
    >
      <button
        type="button"
        className={`filter-pill${selected ? " filter-pill-active" : ""}`}
      >
        <img src={icon} alt="" width={20} height={20} />
        <span className="filter-pill-text">
          {selected ? selected.label : placeholder}
        </span>
        <img src={chevronDown} alt="" width={20} height={20} />
      </button>
    </Dropdown>
  );
}
