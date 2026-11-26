import { Dropdown } from 'antd';
import chevronDown from '../../assets/icons/chevron-down-light.svg';

interface FilterPillOption<T> {
  label: string;
  value: T;
}

interface FilterPillProps<T extends string | number> {
  icon: string;
  placeholder: string;
  value: T | null;
  options: FilterPillOption<T>[];
  onChange: (value: T | null) => void;
  /** Label of the menu item that clears the filter. Omit to make the filter required. */
  clearLabel?: string;
}

const CLEAR_KEY = '__all';

/** Rounded "Filter Quarter" / "Filter Year" control from the Overview header. */
export default function FilterPill<T extends string | number>({
  icon,
  placeholder,
  value,
  options,
  onChange,
  clearLabel,
}: FilterPillProps<T>) {
  const selected = options.find((o) => o.value === value);

  const items = [
    ...(clearLabel ? [{ key: CLEAR_KEY, label: clearLabel }] : []),
    ...options.map((o) => ({ key: String(o.value), label: o.label })),
  ];

  const handleClick = ({ key }: { key: string }) => {
    if (key === CLEAR_KEY) {
      onChange(null);
      return;
    }
    onChange(options.find((o) => String(o.value) === key)?.value ?? null);
  };

  return (
    <Dropdown
      menu={{ items, selectable: true, selectedKeys: [value === null ? CLEAR_KEY : String(value)], onClick: handleClick }}
      trigger={['click']}
      placement="bottomRight"
      overlayClassName="filter-pill-menu"
    >
      <button type="button" className={`filter-pill${selected ? ' filter-pill--active' : ''}`}>
        <img src={icon} alt="" width={20} height={20} />
        <span className="filter-pill__text">{selected ? selected.label : placeholder}</span>
        <img src={chevronDown} alt="" width={20} height={20} />
      </button>
    </Dropdown>
  );
}
