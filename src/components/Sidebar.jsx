import { NavLink } from "react-router-dom";
import {
  Sparkles,
  LayoutGrid,
  GraduationCap,
  ScrollText,
  MessagesSquare,
} from "lucide-react";
import { students } from "../data/students";

const navGroups = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutGrid, end: true }],
  },
  {
    label: "Academics",
    items: [
      { to: "/students", label: "Students", icon: GraduationCap, badge: students.length },
      { to: "/policies", label: "Policies", icon: ScrollText },
    ],
  },
  {
    label: "Assistant",
    items: [{ to: "/ask", label: "Ask the Registrar", icon: MessagesSquare }],
  },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={"sidebar" + (open ? " open" : "")}>
      <div className="brand">
        <div className="mark">
          <Sparkles size={17} strokeWidth={2} />
        </div>
        <div>
          <div className="name">CampusOS</div>
          <div className="sub">College management</div>
        </div>
      </div>

      <div className="org-card">
        <div className="avatar">MU</div>
        <div>
          <div className="org-name">Meridian University</div>
          <div className="org-sub">Administration portal</div>
        </div>
      </div>

      {navGroups.map((group) => (
        <div key={group.label}>
          <div className="nav-section-label">{group.label.toUpperCase()}</div>
          {group.items.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
            >
              <span className="nav-item-inner">
                <Icon size={16} strokeWidth={1.8} />
                {label}
              </span>
              {badge != null && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-promo">
        <div className="promo-icon">
          <Sparkles size={16} strokeWidth={2} />
        </div>
        <div className="promo-title">Ask the Registrar</div>
        <div className="promo-body">
          Ask a plain-English question about grades, attendance, enrollment,
          or policies and get a straight answer.
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="avatar-round">JD</div>
        <div>
          <div className="who-name">Jordan Davis</div>
          <div className="who-role">Super admin</div>
        </div>
      </div>
    </aside>
  );
}
