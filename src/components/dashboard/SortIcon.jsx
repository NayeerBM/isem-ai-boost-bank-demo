import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const ICONS = {
  default: CalendarOutlined,
  desc: ArrowDownOutlined,
  asc: ArrowUpOutlined,
};

export default function SortIcon({ sort }) {
  const Icon = ICONS[sort];
  return <Icon aria-hidden="true" />;
}
