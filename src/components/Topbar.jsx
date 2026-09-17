import { useLocation } from "react-router-dom";
import { Search, Bell, HelpCircle } from "lucide-react";

const titles = {
  "/": "Dashboard",
  "/students": "Students",
  "/policies": "Policies",
  "/ask": "Ask the Registrar",
};

export default function Topbar() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "CampusOS";

  return (
    <div className="topbar">
      <div className="breadcrumb">
        Meridian University <span>›</span> <b>{title}</b>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={14} />
          Search anything…
        </div>
        <button className="topbar-icon-btn">
          <Bell size={17} strokeWidth={1.8} />
          <span className="dot" />
        </button>
        <button className="topbar-icon-btn">
          <HelpCircle size={17} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
