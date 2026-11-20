import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import { RequireMember, RequireTrainer } from './components/common/RouteGuards';
import DashboardPage from './pages/trainer/DashboardPage';
import CalendarPage from './pages/calendar/CalendarPage';
import AttendancePage from './pages/trainer/AttendancePage';
import QuotaPage from './pages/quota/QuotaPage';
import WorkoutsPage from './pages/workouts/WorkoutsPage';
import ProgressPage from './pages/progress/ProgressPage';
import SettingsPage from './pages/trainer/SettingsPage';
import MembersPage from './pages/members/MembersPage';
import MemberDetailPage from './pages/members/MemberDetailPage';
const MemberPortalLayout = lazy(() => import('./layouts/MemberPortalLayout'));
const MemberHomePage = lazy(() => import('./pages/member/MemberHomePage'));
const MemberBookingPage = lazy(() => import('./pages/member/MemberBookingPage'));
const MemberWorkoutPage = lazy(() => import('./pages/member/MemberWorkoutPage'));
const MemberProgressPage = lazy(() => import('./pages/member/MemberProgressPage'));
const MemberProfilePage = lazy(() => import('./pages/member/MemberProfilePage'));
import { PortalProvider } from './context/PortalContext';
import { useWorkspace } from './hooks/useWorkspace';

function PortalWrapper() {
  const { members } = useWorkspace();

  return (
    <PortalProvider defaultMemberId={members[0]?.id}>
      <MemberPortalLayout />
    </PortalProvider>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading" />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireTrainer><AppLayout /></RequireTrainer>}>
          <Route path="/" element={<DashboardPage />} />

          <Route path="/members" element={<MembersPage />} />
          <Route path="/members/:memberId" element={<MemberDetailPage />} />

          <Route path="/calendar" element={<CalendarPage />} />

          <Route path="/quota" element={<QuotaPage />} />

          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/progress" element={<ProgressPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/m"
          element={<RequireMember><PortalWrapper /></RequireMember>}
        >
          <Route index element={<Navigate to="/m/home" replace />} />
          <Route path="home" element={<MemberHomePage />} />
          <Route path="booking" element={<MemberBookingPage />} />
          <Route path="workout" element={<MemberWorkoutPage />} />
          <Route path="progress" element={<MemberProgressPage />} />
          <Route path="profile" element={<MemberProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
