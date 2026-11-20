import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Users,
  X,
} from 'lucide-react';

import {
  dashboardStats,
  upcomingSessions,
  pendingBookings,
  lowQuotaMembers,
} from '../../data/mockDashboard';

const statIcons = {
  users: Users,
  calendar: CalendarDays,
  clock: Clock3,
  alert: AlertCircle,
};

function StatCard({ stat }) {
  const Icon = statIcons[stat.icon];

  return (
    <div className="card stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{stat.label}</span>

        <div className={`stat-icon stat-icon--${stat.color}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="stat-value">{stat.value}</div>

      <div className="stat-footer">
        <span>{stat.description}</span>
        <span className={`stat-trend stat-trend--${stat.color}`}>
          {stat.trend}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const labels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
  };

  return (
    <span className={`status-badge status-badge--${status}`}>
      {labels[status]}
    </span>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      <button className="text-button">
        {action}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="page-container">
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">FRIDAY, NOVEMBER 20, 2026</span>
          <h1>Good morning, Bintang 👋</h1>
          <p>Here's what's happening with your training studio today.</p>
        </div>

        <button className="primary-button">
          <CalendarDays size={17} />
          Manage Schedule
        </button>
      </div>

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      <div className="dashboard-grid">
        <section className="card sessions-card">
          <SectionHeader
            title="Upcoming Sessions"
            action="View calendar"
          />

          <div className="session-list">
            {upcomingSessions.map((session) => (
              <div className="session-item" key={session.id}>
                <div className="member-avatar">
                  {session.initials}
                </div>

                <div className="session-member">
                  <strong>{session.member}</strong>
                  <span>{session.program}</span>
                </div>

                <div className="session-time">
                  <Clock3 size={14} />
                  <span>{session.time}</span>
                </div>

                <StatusBadge status={session.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="card quota-card">
          <SectionHeader
            title="Low Quota Alert"
            action="View all"
          />

          <p className="section-description">
            Members who are running low on training sessions.
          </p>

          <div className="quota-list">
            {lowQuotaMembers.map((member) => (
              <div className="quota-item" key={member.id}>
                <div className="quota-member">
                  <strong>{member.name}</strong>
                  <span>{member.remaining} sessions remaining</span>
                </div>

                <div className="quota-progress">
                  <div className="quota-progress-track">
                    <div
                      className="quota-progress-fill"
                      style={{
                        width: `${(member.remaining / member.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card pending-card">
        <SectionHeader
          title="Pending Booking Requests"
          action="View all bookings"
        />

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>DATE</th>
                <th>TIME</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {pendingBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="table-member">
                      <div className="member-avatar">
                        {booking.initials}
                      </div>
                      <strong>{booking.member}</strong>
                    </div>
                  </td>

                  <td>{booking.date}</td>
                  <td>{booking.time}</td>

                  <td>
                    <StatusBadge status="pending" />
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="action-button action-approve"
                        title="Approve"
                        aria-label={`Approve ${booking.member}`}
                      >
                        <Check size={16} />
                      </button>

                      <button
                        className="action-button action-reject"
                        title="Reject"
                        aria-label={`Reject ${booking.member}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
