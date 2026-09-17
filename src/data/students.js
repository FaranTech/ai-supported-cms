// This is our "structured database" — the kind of data a real MCP server
// would pull from a real college database. Here it's just an array so you
// can see the mechanics with nothing hidden behind an API.

export const students = [
  {
    id: 1,
    name: "Ayesha Raza",
    program: "BS Computer Science",
    semester: 5,
    gpa: 3.72,
    attendance: 91,
    courses: [
      { code: "CS301", title: "Algorithms", grade: "A-" },
      { code: "CS315", title: "Databases", grade: "A" },
      { code: "MATH210", title: "Linear Algebra", grade: "B+" },
    ],
  },
  {
    id: 2,
    name: "Hamza Tariq",
    program: "BS Computer Science",
    semester: 5,
    gpa: 2.81,
    attendance: 68,
    courses: [
      { code: "CS301", title: "Algorithms", grade: "C+" },
      { code: "CS315", title: "Databases", grade: "B-" },
      { code: "MATH210", title: "Linear Algebra", grade: "C" },
    ],
  },
  {
    id: 3,
    name: "Fatima Noor",
    program: "BBA",
    semester: 3,
    gpa: 3.95,
    attendance: 97,
    courses: [
      { code: "BUS210", title: "Marketing Principles", grade: "A" },
      { code: "BUS220", title: "Financial Accounting", grade: "A" },
      { code: "ECO101", title: "Microeconomics", grade: "A-" },
    ],
  },
  {
    id: 4,
    name: "Bilal Ahmed",
    program: "BS Electrical Engineering",
    semester: 7,
    gpa: 3.10,
    attendance: 74,
    courses: [
      { code: "EE401", title: "Power Systems", grade: "B" },
      { code: "EE420", title: "Control Systems", grade: "B-" },
      { code: "EE415", title: "Digital Signal Processing", grade: "B+" },
    ],
  },
];

export const courseEnrollment = [
  { code: "CS301", title: "Algorithms", enrolled: 62, capacity: 70 },
  { code: "CS315", title: "Databases", enrolled: 58, capacity: 60 },
  { code: "MATH210", title: "Linear Algebra", enrolled: 90, capacity: 100 },
  { code: "BUS210", title: "Marketing Principles", enrolled: 45, capacity: 50 },
  { code: "EE401", title: "Power Systems", enrolled: 30, capacity: 35 },
];
