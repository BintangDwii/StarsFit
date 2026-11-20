import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import { RequireMember, RequireTrainer } from './components/common/RouteGuards';
import DashboardPage from './pages/trainer/DashboardPage';

const CalendarPage = lazy(() => import('./pages/calendar/CalendarPage'));
const AttendancePage = lazy(() => import('./pages/trainer/AttendancePage'));
const QuotaPage = lazy(() => import('./pages/quota/QuotaPage'));
const WorkoutsPage = lazy(() => import('./pages/workouts/WorkoutsPage'));
const ExercisesPage = lazy(() => import('./pages/workouts/ExercisesPage'));
const ProgressPage = lazy(() => import('./pages/progress/ProgressPage'));
const SettingsPage = lazy(() => import('./pages/trainer/SettingsPage'));
const MembersPage = lazy(() => import('./pages/members/MembersPage'));
const MemberDetailPage = lazy(() => import('./pages/members/MemberDetailPage'));
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
          <Route path="/exercises" element={<ExercisesPage />} />
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
