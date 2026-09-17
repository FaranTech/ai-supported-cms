import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Policies from "./pages/Policies";
import Ask from "./pages/Ask";

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/ask" element={<Ask />} />
            </Routes>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}
