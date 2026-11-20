import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, Dumbbell, TrendingUp } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import { formatLongDate } from '../../lib/dates';
import { usePortal } from '../../hooks/usePortal';
import { useWorkspace } from '../../hooks/useWorkspace';

export default function MemberHomePage() {
  const navigate = useNavigate();
  const { memberId } = usePortal();
  const { members, bookings, programs, progress } = useWorkspace();

  const member = members.find((item) => item.id === memberId) || members[0];
  const quota = member?.quota;

  const nextSession = bookings
    .filter(
      (booking) =>
        booking.memberId === member?.id &&
        booking.date >= new Date().toISOString().slice(0, 10) &&
        ['confirmed', 'checked_in', 'pending'].includes(booking.status)
    )
    .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];

  const activeProgram = programs.find(
    (program) => program.memberId === member?.id && program.isActive
  );

  const latestProgress = (progress[member?.id] || [])[0];

  return (
    <div className="portal-page">
      <div className="portal-greeting">
        <span>MEMBER PORTAL</span>
        <h1>Halo, {member?.name.split(' ')[0]} 👋</h1>
        <p>Berikut ringkasan latihanmu hari ini.</p>
      </div>

      <section className="portal-quota-card">
        <div className="portal-quota-head">
          <span>Sisa kuota latihan</span>
          <Badge status={quota?.unlimited ? 'info' : 'active'}>
            {quota?.unlimited ? 'Unlimited' : 'Aktif'}
          </Badge>
        </div>
        <strong>{quota?.unlimited ? '∞' : quota?.available ?? 0}</strong>
        <span className="portal-quota-caption">
          {quota?.unlimited
            ? 'Kuota unlimited'
            : `dari ${quota?.total ?? 0} sesi tersedia`}
        </span>
        <div className="quota-progress-track">
          <div
            className="quota-progress-fill"
            style={{
              width: `${quota?.unlimited ? 100 : Math.min(100, ((quota?.available || 0) / Math.max(1, quota?.total || 1)) * 100)}%`,
            }}
          />
        </div>
        <button className="portal-primary-button" onClick={() => navigate('/m/booking')}>
          <CalendarDays size={17} /> Book Session
        </button>
      </section>

      <section className="portal-section">
        <h2>Sesi berikutnya</h2>
        <div className="portal-card">
          {nextSession ? (
            <>
              <div className="portal-card-row">
                <div className="portal-icon"><CalendarDays size={18} /></div>
                <div>
                  <strong>
                    {formatLongDate(new Date(`${nextSession.date}T00:00:00`))}
                  </strong>
                  <span>{nextSession.start} - {nextSession.end}</span>
                </div>
                <Badge status={nextSession.status} />
              </div>
              <p className="portal-note">Trainer: {nextSession.trainerName || 'Bintang Kuat'}</p>
            </>
          ) : (
            <p className="muted-copy">Belum ada sesi terjadwal.</p>
          )}
        </div>
      </section>

      <section className="portal-section">
        <h2>Program latihan</h2>
        <div className="portal-card">
          {activeProgram ? (
            <div className="portal-card-row">
              <div className="portal-icon"><Dumbbell size={18} /></div>
              <div>
                <strong>{activeProgram.title}</strong>
                <span>{activeProgram.days?.length || 0} hari latihan</span>
              </div>
              <ArrowRight size={16} />
            </div>
          ) : (
            <p className="muted-copy">Belum ada program aktif.</p>
          )}
        </div>
      </section>

      <section className="portal-section">
        <h2>Progress terbaru</h2>
        <div className="portal-card">
          {latestProgress ? (
            <div className="portal-card-row">
              <div className="portal-icon"><TrendingUp size={18} /></div>
              <div>
                <strong>{latestProgress.weight} kg</strong>
                <span>
                  {new Date(latestProgress.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
              {latestProgress.bodyFat && <span className="portal-mini-stat">BF {latestProgress.bodyFat}%</span>}
            </div>
          ) : (
            <p className="muted-copy">Belum ada catatan progress.</p>
          )}
        </div>
      </section>
    </div>
  );
}
