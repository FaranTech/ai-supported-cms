import { useState, Fragment } from "react";
import { Search, ChevronRight } from "lucide-react";
import { students } from "../data/students";

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Students() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.program.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="eyebrow">Academics</div>
          <h1 className="page-title">Students</h1>
          <p className="page-sub">
            See your attendance, GPA, and grades at a glance. Click your name
            to expand full course-by-course results.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by name or program…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card card-pad">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Program</th>
              <th>Semester</th>
              <th>GPA</th>
              <th>Attendance</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <Fragment key={s.id}>
                <tr
                  className="expandable"
                  onClick={() => setOpenId(openId === s.id ? null : s.id)}
                >
                  <td>
                    <div className="row-avatar">
                      <div className="initials">{initials(s.name)}</div>
                      <div>
                        <div className="row-name">{s.name}</div>
                        <div className="row-id">STU-{1000 + s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.program}</td>
                  <td>Year {Math.ceil(s.semester / 2)}</td>
                  <td>{s.gpa}</td>
                  <td>
                    {s.attendance < 75 ? (
                      <span className="badge bad">
                        <span className="dot" /> {s.attendance}%
                      </span>
                    ) : s.attendance >= 90 ? (
                      <span className="badge ok">
                        <span className="dot" /> {s.attendance}%
                      </span>
                    ) : (
                      <span className="badge warn">
                        <span className="dot" /> {s.attendance}%
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={"chevron" + (openId === s.id ? " open" : "")}>
                      <ChevronRight size={15} />
                    </span>
                  </td>
                </tr>
                {openId === s.id && (
                  <tr>
                    <td colSpan={6} style={{ padding: 0, border: "none" }}>
                      <div className="student-detail">
                        {s.courses.map((c) => (
                          <div className="course-row" key={c.code}>
                            <span>
                              {c.code} — {c.title}
                            </span>
                            <span style={{ fontWeight: 600 }}>{c.grade}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
