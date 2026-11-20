import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  CalendarDays,
  Dumbbell,
  Home,
  TrendingUp,
  User,
} from 'lucide-react';

import { usePortal } from '../hooks/usePortal';
import { useWorkspace } from '../hooks/useWorkspace';

const navigation = [
  { name: 'Home', path: '/m/home', icon: Home },
  { name: 'Booking', path: '/m/booking', icon: CalendarDays },
  { name: 'Workout', path: '/m/workout', icon: Dumbbell },
  { name: 'Progress', path: '/m/progress', icon: TrendingUp },
  { name: 'Profile', path: '/m/profile', icon: User },
];

export default function MemberPortalLayout() {
  const { members } = useWorkspace();
  const { memberId } = usePortal();
  const member = members.find((item) => item.id === memberId) || members[0];

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="portal-brand">
          <div className="brand-icon"><Activity size={18} strokeWidth={2.5} /></div>
          <strong>fitflow</strong>
        </div>
        <div className="portal-user">
          <div className="member-avatar">{member?.initials}</div>
          <span>{member?.name}</span>
        </div>
      </header>

      <main className="portal-main">
        <Outlet />
      </main>

      <nav className="portal-bottom-nav" aria-label="Navigasi member">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `portal-nav-item ${isActive ? 'portal-nav-item--active' : ''}`
              }
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
