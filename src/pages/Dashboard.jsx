import {
  Plus,
  GraduationCap,
  Users,
  CalendarCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";
import { students, courseEnrollment } from "../data/students";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const activity = [
  {
    icon: GraduationCap,
    color: "var(--accent)",
    bg: "var(--purple-soft)",
    title: "New student enrolled",
    sub: `${students[2].name} joined ${students[2].program}`,
    time: "12 min ago",
  },
  {
    icon: CalendarCheck,
    color: "var(--green)",
    bg: "var(--green-soft)",
    title: "Attendance synced",
    sub: "Weekly attendance report generated",
    time: "48 min ago",
  },
  {
    icon: AlertTriangle,
    color: "var(--amber)",
    bg: "var(--amber-soft)",
    title: "Low attendance flag",
    sub: `${students.find((s) => s.attendance < 75)?.name} below 75% threshold`,
    time: "2 hours ago",
  },
  {
    icon: Users,
    color: "var(--blue)",
    bg: "var(--blue-soft)",
    title: "Advisor meeting scheduled",
    sub: "Academic Standards Committee · Thursday 10:00 AM",
    time: "4 hours ago",
  },
];

export default function Dashboard() {
  const avgGpa = (
    students.reduce((sum, s) => sum + s.gpa, 0) / students.length
  ).toFixed(2);
  const avgAttendance = Math.round(
    students.reduce((sum, s) => sum + s.attendance, 0) / students.length
  );
  const atRisk = students.filter((s) => s.attendance < 75).length;

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="eyebrow">{today}</div>
          <h1 className="page-title">Good morning, Jordan ✨</h1>
          <p className="page-sub">Here's what's happening across your campus today.</p>
        </div>
        <button className="btn-primary">
          <Plus size={15} /> Add student
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: "var(--purple-soft)" }}>
            <GraduationCap size={17} color="var(--accent)" strokeWidth={1.8} />
          </div>
          <div className="stat-label">Total students</div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-trend">
            <ArrowUpRight size={13} /> 12.5%{" "}
            <span className="trend-label">vs. last semester</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: "var(--blue-soft)" }}>
            <Users size={17} color="var(--blue)" strokeWidth={1.8} />
          </div>
          <div className="stat-label">Average GPA</div>
          <div className="stat-value">{avgGpa}</div>
          <div className="stat-trend">
            <ArrowUpRight size={13} /> 4.2%{" "}
            <span className="trend-label">vs. last semester</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: "var(--green-soft)" }}>
            <CalendarCheck size={17} color="var(--green)" strokeWidth={1.8} />
          </div>
          <div className="stat-label">Attendance rate</div>
          <div className="stat-value">{avgAttendance}%</div>
          <div className="stat-trend">
            <ArrowUpRight size={13} /> 2.8% <span className="trend-label">this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: "var(--amber-soft)" }}>
            <AlertTriangle size={17} color="var(--amber)" strokeWidth={1.8} />
          </div>
          <div className="stat-label">Below 75% attendance</div>
          <div className="stat-value">{atRisk}</div>
          <div className="stat-trend down">
            <ArrowDownRight size={13} /> flagged{" "}
            <span className="trend-label">this month</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card card-pad">
          <div className="card-head">
            <div>
              <h3>Attendance overview</h3>
              <div className="card-sub">Average attendance across all students</div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            {students.map((s) => (
              <div className="bar-row" key={s.id}>
                <span className="bar-name">{s.name.split(" ")[0]}</span>
                <div className="bar-track">
                  <div
                    className={"bar-fill" + (s.attendance < 75 ? " low" : "")}
                    style={{ width: `${s.attendance}%` }}
                  />
                </div>
                <span className="bar-value">{s.attendance}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-head">
            <div>
              <h3>Recent activity</h3>
              <div className="card-sub">Latest updates from your campus</div>
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            {activity.map((a, i) => (
              <div className="activity-row" key={i}>
                <div className="activity-icon" style={{ background: a.bg }}>
                  <a.icon size={15} color={a.color} strokeWidth={2} />
                </div>
                <div>
                  <div className="activity-title">{a.title}</div>
                  <div className="activity-sub">{a.sub}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="card-head">
          <div>
            <h3>Course enrollment</h3>
            <div className="card-sub">Enrolled vs. capacity by course</div>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Title</th>
                <th>Enrolled</th>
                <th>Capacity</th>
                <th>Fill</th>
              </tr>
            </thead>
            <tbody>
              {courseEnrollment.map((c) => {
                const pct = Math.round((c.enrolled / c.capacity) * 100);
                return (
                  <tr key={c.code}>
                    <td style={{ fontWeight: 600 }}>{c.code}</td>
                    <td>{c.title}</td>
                    <td>{c.enrolled}</td>
                    <td>{c.capacity}</td>
                    <td>
                      <span className={"badge " + (pct >= 90 ? "warn" : "ok")}>
                        <span className="dot" /> {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="view-all-link">
          View all courses <ChevronRight size={13} />
        </div>
      </div>
    </>
  );
}
