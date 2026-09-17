// These functions are written exactly like MCP tool handlers would be —
// same shape as the task-mcp-server we built earlier: a name, a job, a
// return value. The only difference from a real MCP server is these run
// in-browser instead of over stdio/HTTP, so you can see them fire live.

import { students, courseEnrollment } from "../data/students.js";

export function getStudentByName(name) {
  const match = students.find((s) =>
    s.name.toLowerCase().includes(name.toLowerCase())
  );
  return match || null;
}

export function getAttendance(name) {
  const s = getStudentByName(name);
  if (!s) return null;
  return { name: s.name, attendance: s.attendance };
}

export function getGrades(name) {
  const s = getStudentByName(name);
  if (!s) return null;
  return { name: s.name, gpa: s.gpa, courses: s.courses };
}

export function getLowAttendanceStudents(threshold = 75) {
  return students
    .filter((s) => s.attendance < threshold)
    .map((s) => ({ name: s.name, attendance: s.attendance }));
}

export function getEnrollment(courseCode) {
  return (
    courseEnrollment.find(
      (c) => c.code.toLowerCase() === courseCode.toLowerCase()
    ) || null
  );
}

export function getPerformanceTrend() {
  // A tiny "analysis" tool: correlate attendance with GPA across students.
  const sorted = [...students].sort((a, b) => a.attendance - b.attendance);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  return {
    summary: `${lowest.name} has the lowest attendance (${lowest.attendance}%) and a GPA of ${lowest.gpa}. ${highest.name} has the highest attendance (${highest.attendance}%) and a GPA of ${highest.gpa}.`,
    students: students.map((s) => ({
      name: s.name,
      attendance: s.attendance,
      gpa: s.gpa,
    })),
  };
}
