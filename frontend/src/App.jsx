import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import AnalysisDetails from "./pages/AnalysisDetails";
import AnalysisHistory from "./pages/AnalysisHistory";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NewAnalysis from "./pages/NewAnalysis";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Reports from "./pages/Reports";

function AppShell({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
      <Route path="/analysis/new" element={<AppShell><NewAnalysis /></AppShell>} />
      <Route path="/analysis/history" element={<AppShell><AnalysisHistory /></AppShell>} />
      <Route path="/analysis/:id" element={<AppShell><AnalysisDetails /></AppShell>} />
      <Route path="/reports" element={<AppShell><Reports /></AppShell>} />
      <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
