import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { NewDownloadPage } from "@/pages/NewDownloadPage";
import { DownloadDetailPage } from "@/pages/DownloadDetailPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { RequireSelection } from "@/components/RequireSelection";
import { LoginPage } from "@/pages/LoginPage";
import { AuthGuard } from "@/components/AuthGuard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AuthGuard />}>
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<RequireSelection><AppShell /></RequireSelection>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/new" element={<NewDownloadPage />} />
            <Route path="/downloads/:id" element={<DownloadDetailPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
