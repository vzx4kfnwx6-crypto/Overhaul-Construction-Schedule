import React from "react";
import { BrowserRouter, Routes, Route, HashRouter, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProjectList } from "./pages/ProjectList";
import { ScheduleGuide } from "./pages/ScheduleGuide";
import { ProjectEdit } from "./pages/ProjectEdit";
import { ProjectDashboard } from "./pages/ProjectDashboard";
import { CalendarView } from "./pages/CalendarView";
import { Home } from "./pages/Home";
import { ArchivedProjects } from "./pages/ArchivedProjects";
import { ProjectProvider } from "./context/ProjectContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { AuthProvider } from "./context/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { Login } from "./pages/Login";

import { WorkspaceSettings } from "./pages/WorkspaceSettings";

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ProjectProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
                <Route index element={<Home />} />
                <Route path="tasks" element={<ProjectList />} />
                <Route path="schedule" element={<ScheduleGuide />} />
                <Route path="calendar" element={<CalendarView />} />
                <Route path="archived" element={<ArchivedProjects />} />
                <Route path="team" element={<WorkspaceSettings />} />
                <Route path="edit/:id" element={<ProjectEdit />} />
                <Route path="project/:id" element={<ProjectDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </HashRouter>
        </ProjectProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}
