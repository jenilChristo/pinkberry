import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SleepPage } from './pages/SleepPage';
import { FeedingPage } from './pages/FeedingPage';
import { DiaperPage } from './pages/DiaperPage';
import { GrowthPage } from './pages/GrowthPage';
import { CryAnalyzerPage } from './pages/CryAnalyzerPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

interface AppRouterProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export function AppRouter({ toggleTheme, isDark }: AppRouterProps) {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout toggleTheme={toggleTheme} isDark={isDark} />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sleep" element={<SleepPage />} />
        <Route path="/feeding" element={<FeedingPage />} />
        <Route path="/diaper" element={<DiaperPage />} />
        <Route path="/growth" element={<GrowthPage />} />
        <Route path="/cry-analyzer" element={<CryAnalyzerPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
