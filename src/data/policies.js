// This is our "document store" — unstructured text, the kind a real RAG
// system would chunk and embed into a vector database. Here we keep it as
// plain text chunks and do simple keyword-overlap retrieval instead of real
// embeddings, so you can see the retrieval mechanic without needing an API
// key or an embedding model.

export const policies = [
  {
    id: "p1",
    title: "Medical Leave During Exams",
    text: "Students who fall ill before or during a scheduled exam must submit a medical certificate from a registered physician within 3 working days. The Examination Committee reviews such requests and may grant a makeup exam. Self-certified illness without documentation is not accepted for final exams.",
  },
  {
    id: "p2",
    title: "Minimum Attendance Requirement",
    text: "Students must maintain at least 75% attendance in each enrolled course to be eligible to sit the final exam. Students falling below this threshold will be marked as having a shortage of attendance and must petition the Dean's office for exceptional approval, which is granted only for documented medical or family emergencies.",
  },
  {
    id: "p3",
    title: "Academic Probation Policy",
    text: "A student whose semester GPA falls below 2.0 is placed on academic probation for the following semester. Two consecutive semesters on probation may result in dismissal from the program, subject to review by the Academic Standards Committee. Students on probation are required to meet with an academic advisor before course registration.",
  },
  {
    id: "p4",
    title: "Plagiarism and Academic Integrity",
    text: "Submitting another person's work, unauthorized collaboration, or use of AI-generated content without disclosure as required by course policy is treated as academic dishonesty. First offenses typically result in a zero on the assignment; repeated offenses may lead to course failure or disciplinary review by the Academic Integrity Committee.",
  },
  {
    id: "p5",
    title: "Semester Break and Holiday Schedule",
    text: "The university observes a two-week semester break following final exams each term. Public holidays observed during the semester are announced by the Registrar's office at the start of term and posted on the academic calendar. No classes or exams are scheduled on observed public holidays.",
  },
  {
    id: "p6",
    title: "Fee Payment and Late Fee Policy",
    text: "Semester fees are due within the first two weeks of the term. A late fee of 5% is applied for payments made after the deadline, increasing to 10% after four weeks. Students with unresolved dues after six weeks may have their course registration cancelled for that semester.",
  },
];

// Very small, dependency-free keyword-overlap "retriever." Real RAG uses
// embeddings + vector similarity; this does the same job at a much cruder
// level so the mechanic is visible and needs no API call.
export function searchPolicies(query, topK = 2) {
  const queryWords = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = policies.map((doc) => {
    const docText = (doc.title + " " + doc.text).toLowerCase();
    const score = queryWords.reduce(
      (sum, w) => sum + (docText.includes(w) ? 1 : 0),
      0
    );
    return { ...doc, score };
  });

  return scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
