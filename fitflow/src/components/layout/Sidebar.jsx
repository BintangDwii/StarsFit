import {
  Activity,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Dumbbell,
  LayoutDashboard,
  Layers3,
  Settings,
  Users,
  X,
} from 'lucide-react';

import { NavLink } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

const navigation = [
  {
    label: 'WORKSPACE',
    items: [
      {
        name: 'Overview',
        path: '/',
        icon: LayoutDashboard,
      },
      {
        name: 'Calendar',
        path: '/calendar',
        icon: CalendarDays,
      },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      {
        name: 'Members',
        path: '/members',
        icon: Users,
      },
      {
        name: 'Quota Management',
        path: '/quota',
        icon: Layers3,
      },
    ],
  },
  {
    label: 'COACHING',
    items: [
      {
        name: 'Attendance',
        path: '/attendance',
        icon: ClipboardCheck,
      },
      {
        name: 'Workout Programs',
        path: '/workouts',
        icon: Dumbbell,
      },
      {
        name: 'Progress Tracking',
        path: '/progress',
        icon: BarChart3,
      },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const { demoMode, memberships, tenantId, selectTenant } = useAuth();

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={22} strokeWidth={2.5} />
          </div>

          <div className="brand-copy">
            <span className="brand-name">fitflow</span>
            <span className="brand-caption">TRAINER STUDIO</span>
          </div>
        </div>

        <button
          className="icon-button sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={19} />
        </button>
      </div>

      <div className="workspace-switcher">
        <div className="workspace-avatar">B</div>

        <div className="workspace-info">
          <strong>My Workspace</strong>
          <span>Personal Training</span>
          {!demoMode && memberships.length > 1 && (
            <select
              className="workspace-select"
              value={tenantId || ''}
              onChange={(event) => selectTenant(event.target.value)}
              aria-label="Pilih workspace"
            >
              {memberships.map((membership, index) => (
                <option key={membership.id} value={membership.tenant_id}>
                  Workspace {index + 1} · {membership.role}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <nav className="sidebar-navigation">
        {navigation.map((group) => (
          <div className="nav-group" key={group.label}>
            <span className="nav-group-label">
              {group.label}
            </span>

            <div className="nav-items">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link--active' : ''}`
                    }
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `nav-link ${isActive ? 'nav-link--active' : ''}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <div className="sidebar-profile">
          <div className="profile-avatar">BK</div>

          <div className="profile-info">
            <strong>Bintang Kuat</strong>
            <span>Personal Trainer</span>
          </div>
        </div>

        <div className="sidebar-version">
          FITFLOW v0.1.0
        </div>
      </div>
    </aside>
  );
}
