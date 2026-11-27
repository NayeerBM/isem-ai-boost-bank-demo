import logo from "../../assets/logo.svg";
import "./AppHeader.scss";

export default function AppHeader({ homePath }) {
  return (
    <header className="app-header">
      <a className="app-header-logo" href={homePath} aria-label="iSEM.ai home">
        <img src={logo} alt="iSEM.ai" width={115} height={18} />
      </a>
    </header>
  );
}
