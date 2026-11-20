import { Navigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

function LoadingScreen({ message = 'Memuat workspace...' }) {
  return (
    <div className="route-loading">
      <div className="card placeholder-card">
        <div className="empty-state">
          <h3>{message}</h3>
          <p>Mohon tunggu sebentar.</p>
        </div>
      </div>
    </div>
  );
}

export function RequireTrainer({ children }) {
  const { demoMode, loading, session, role, tenantId } = useAuth();

  if (demoMode) return children;
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (!tenantId) return <LoadingScreen message="Akun belum memiliki workspace" />;
  if (role === 'member') return <Navigate to="/m/home" replace />;

  return children;
}

export function RequireMember({ children }) {
  const { demoMode, loading, session, role, tenantId } = useAuth();

  if (demoMode) return children;
  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (!tenantId) return <LoadingScreen message="Akun belum memiliki workspace" />;
  if (role !== 'member') return <Navigate to="/" replace />;

  return children;
}
