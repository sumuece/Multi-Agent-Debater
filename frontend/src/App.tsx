import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import DebatePage from "./pages/DebatePage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import LogsPage from "./pages/LogsPage";
import OfflinePage from "./pages/OfflinePage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/offline" element={<OfflinePage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DebatePage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
