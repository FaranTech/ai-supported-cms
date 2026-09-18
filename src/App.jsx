import { useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Policies from "./pages/Policies";
import Ask from "./pages/Ask";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="app">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <div className="main">
          <Topbar onMenuClick={() => setSidebarOpen((open) => !open)} />
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
