import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, UserCheck, UserX } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import { toISO } from '../../lib/dates';
import { useWorkspace } from '../../hooks/useWorkspace';

const TODAY_ISO = toISO(new Date());

export default function AttendancePage() {
  const {
    bookings,
    checkInBooking,
    completeBooking,
    markNoShow,
    cancelBooking,
  } = useWorkspace();

  const [date, setDate] = useState(TODAY_ISO);

  const sessions = useMemo(
    () =>
      bookings
        .filter((booking) => booking.date === date)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [bookings, date]
  );

  const counts = useMemo(
    () => ({
      confirmed: sessions.filter((item) => item.status === 'confirmed').length,
      checkedIn: sessions.filter((item) => item.status === 'checked_in').length,
      completed: sessions.filter((item) => item.status === 'completed').length,
      noShow: sessions.filter((item) => item.status === 'no_show').length,
    }),
    [sessions]
  );

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">COACHING</span>
          <h1>Attendance</h1>
          <p>Catat kehadiran dan penyelesaian sesi latihan.</p>
        </div>
        <input
          type="date"
          className="filter-select"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          aria-label="Pilih tanggal"
        />
      </div>

      <section className="stats-grid">
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Confirmed</span>
            <div className="stat-icon stat-icon--blue"><Clock3 size={20} /></div>
          </div>
          <div className="stat-value">{counts.confirmed}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Checked in</span>
            <div className="stat-icon stat-icon--green"><UserCheck size={20} /></div>
          </div>
          <div className="stat-value">{counts.checkedIn}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Completed</span>
            <div className="stat-icon stat-icon--blue"><CheckCircle2 size={20} /></div>
          </div>
          <div className="stat-value">{counts.completed}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">No show</span>
            <div className="stat-icon stat-icon--red"><UserX size={20} /></div>
          </div>
          <div className="stat-value">{counts.noShow}</div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Sesi pada tanggal ini</h2>
          <span className="toolbar-count">{sessions.length} sesi</span>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">
            <h3>Tidak ada sesi</h3>
            <p>Pilih tanggal lain untuk melihat jadwal sesi.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>JAM</th>
                  <th>MEMBER</th>
                  <th>TRAINER</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td><strong>{session.start} - {session.end}</strong></td>
                    <td>
                      <div className="table-member">
                        <div className="member-avatar">
                          {session.memberName.split(' ').slice(0, 2).map((part) => part[0]).join('')}
                        </div>
                        <strong>{session.memberName}</strong>
                      </div>
                    </td>
                    <td>{session.trainerName || 'Bintang Kuat'}</td>
                    <td><Badge status={session.status} /></td>
                    <td>
                      <div className="table-actions">
                        {session.status === 'confirmed' && (
                          <button
                            className="action-button action-view"
                            title="Check in"
                            aria-label={`Check in ${session.memberName}`}
                            onClick={() => checkInBooking(session.id)}
                          >
                            IN
                          </button>
                        )}
                        {['confirmed', 'checked_in'].includes(session.status) && (
                          <button
                            className="action-button action-approve"
                            title="Complete"
                            aria-label={`Selesaikan sesi ${session.memberName}`}
                            onClick={() => completeBooking(session.id)}
                          >
                            ✓
                          </button>
                        )}
                        {['confirmed', 'checked_in'].includes(session.status) && (
                          <button
                            className="action-button action-reject"
                            title="No show"
                            aria-label={`No show ${session.memberName}`}
                            onClick={() => markNoShow(session.id)}
                          >
                            ×
                          </button>
                        )}
                        {session.status === 'pending' && (
                          <button
                            className="action-button action-reject"
                            title="Cancel"
                            aria-label={`Batalkan ${session.memberName}`}
                            onClick={() => cancelBooking(session.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
