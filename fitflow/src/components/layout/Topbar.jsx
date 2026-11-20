import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Menu,
  Search,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useWorkspace } from '../../hooks/useWorkspace';

const routeLabels = {
  '/': 'Overview',
  '/calendar': 'Calendar',
  '/attendance': 'Attendance',
  '/members': 'Members',
  '/quota': 'Quota Management',
  '/workouts': 'Workout Programs',
  '/progress': 'Progress Tracking',
  '/settings': 'Settings',
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useWorkspace();
  const { demoMode: authDemo, signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const current = routeLabels[location.pathname] || 'Detail';
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-divider">/</span>
          {location.pathname.startsWith('/members/') && (
            <>
              <span>Members</span>
              <span className="breadcrumb-divider">/</span>
            </>
          )}
          <strong>{current}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search anything..."
            aria-label="Search anything"
          />
          <kbd>⌘ K</kbd>
        </label>

        <div className="notification-wrapper">
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => setNotificationsOpen((open) => !open)}
          >
            <Bell size={20} />
            {unread > 0 && <span className="notification-dot" />}
          </button>

          {notificationsOpen && (
            <div className="notification-panel">
              <div className="notification-panel-head">
                <strong>Notifications</strong>
                <button
                  className="text-button"
                  onClick={markAllNotificationsRead}
                >
                  <CheckCheck size={14} /> Tandai dibaca
                </button>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="muted-copy">Tidak ada notifikasi.</p>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      className={`notification-item ${item.read ? '' : 'is-unread'}`}
                      onClick={() => markNotificationRead(item.id)}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.body}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="topbar-divider" />

        <button
          className="topbar-user"
          onClick={authDemo ? undefined : signOut}
          title={authDemo ? undefined : 'Keluar'}
        >
          <div className="profile-avatar">BK</div>

          <div className="topbar-user-info">
            <strong>Bintang</strong>
            <span>Trainer</span>
          </div>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
