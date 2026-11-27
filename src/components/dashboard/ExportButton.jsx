import { Tooltip } from "antd";
import shareIcon from "../../assets/icons/share.svg";

export default function ExportButton({ onClick }) {
  return (
    <div className="page-toolbar">
      <Tooltip title="Export CSV" placement="left">
        <button
          type="button"
          className="icon-button"
          onClick={onClick}
          aria-label="Export dashboard data as CSV"
        >
          <img src={shareIcon} alt="" width={20} height={20} />
        </button>
      </Tooltip>
    </div>
  );
}
