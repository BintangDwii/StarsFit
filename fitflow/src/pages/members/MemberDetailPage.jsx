import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  UserRound,
} from 'lucide-react';

import Badge from '../../components/ui/Badge';
import Field from '../../components/ui/Field';
import MemberFormModal from '../../components/members/MemberFormModal';
import Modal from '../../components/ui/Modal';
import ProgressChart from '../../components/progress/ProgressChart';
import QuotaAdjustModal from '../../components/quota/QuotaAdjustModal';
import { useWorkspace } from '../../hooks/useWorkspace';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'quota', label: 'Quota' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'workout', label: 'Workout' },
  { id: 'progress', label: 'Progress' },
  { id: 'activity', label: 'Activity' },
];

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="info-row">
      <div className="info-label">
        {Icon && <Icon size={15} />}
        <span>{label}</span>
      </div>
      <strong>{value || '-'}</strong>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <section className="card detail-card">
      <div className="section-header">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function MemberDetailPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const {
    members,
    bookings,
    programs,
    progress,
    adjustQuota,
    createQuota,
    approveBooking,
    rejectBooking,
    cancelBooking,
    checkInBooking,
    completeBooking,
    updateMember,
    deactivateMember,
    addProgress,
    createProgram,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState('overview');
  const [quotaModal, setQuotaModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [progressModal, setProgressModal] = useState(false);
  const [programTitle, setProgramTitle] = useState('');
  const [progressValues, setProgressValues] = useState({
    weight: '',
    bodyFat: '',
    waist: '',
  });

  const member = members.find((item) => item.id === memberId);

  if (!member) {
    return (
      <div className="page-container">
        <div className="card placeholder-card">
          <div className="empty-state">
            <h3>Member tidak ditemukan</h3>
            <p>Data member mungkin sudah dihapus atau tautan tidak valid.</p>
            <button className="text-button" onClick={() => navigate('/members')}>
              Kembali ke daftar member
            </button>
          </div>
        </div>
      </div>
    );
  }

  const memberBookings = bookings.filter(
    (booking) => booking.memberId === member.id
  );
  const memberPrograms = programs.filter(
    (program) => program.memberId === member.id
  );
  const memberProgress = progress[member.id] || [];
  const quota = member.quota;

  const handleQuotaSubmit = async (values) => {
    if (values.mode === 'adjust') {
      await adjustQuota(member.id, values.delta, values.description);
    } else {
      await createQuota(member.id, values);
    }
    setQuotaModal(false);
  };

  const handleProgressSubmit = async (event) => {
    event.preventDefault();
    await addProgress(member.id, progressValues);
    setProgressValues({ weight: '', bodyFat: '', waist: '' });
    setProgressModal(false);
  };

  const handleCreateProgram = async (event) => {
    event.preventDefault();
    if (!programTitle.trim()) return;
    await createProgram(member.id, programTitle.trim());
    setProgramTitle('');
  };

  const renderOverview = () => (
    <div className="detail-grid">
      <SectionCard title="Profil member">
        <div className="profile-block">
          <div className="member-avatar member-avatar--xl">
            {member.initials}
          </div>
          <div>
            <h3>{member.name}</h3>
            <p>{member.goal || '-'}</p>
            <Badge status={member.status} />
          </div>
        </div>

        <div className="info-list">
          <InfoRow icon={Mail} label="Email" value={member.email} />
          <InfoRow icon={Phone} label="Telepon" value={member.phone} />
          <InfoRow icon={CalendarDays} label="Bergabung" value={formatDate(member.joinedAt)} />
          <InfoRow icon={UserRound} label="Tinggi badan" value={member.height ? `${member.height} cm` : '-'} />
          <InfoRow icon={CalendarDays} label="Tanggal lahir" value={formatDate(member.birthDate)} />
        </div>

        {member.notes && <p className="profile-notes">{member.notes}</p>}
      </SectionCard>

      <div className="detail-side">
        <SectionCard title="Ringkasan kuota">
          <div className="quota-big">
            <strong>{quota?.unlimited ? '∞' : quota?.available ?? 0}</strong>
            <span>sesi tersedia</span>
          </div>
          <div className="quota-progress-track">
            <div
              className="quota-progress-fill"
              style={{
                width: `${quota?.unlimited ? 100 : Math.min(100, ((quota?.available || 0) / Math.max(1, quota?.total || 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="muted-copy">
            {quota?.unlimited
              ? 'Member memiliki kuota unlimited.'
              : `${quota?.available ?? 0} dari ${quota?.total ?? 0} sesi tersisa.`}
          </p>
        </SectionCard>

        <SectionCard
          title="Aksi cepat"
          action={
            <button className="text-button" onClick={() => setEditModal(true)}>
              <Pencil size={14} /> Edit
            </button>
          }
        >
          <div className="quick-actions">
            <button className="secondary-button" onClick={() => setQuotaModal(true)}>
              <Plus size={15} /> Kelola kuota
            </button>
            {member.status === 'active' ? (
              <button
                className="secondary-button danger-text"
                onClick={() => deactivateMember(member.id)}
              >
                <RotateCcw size={15} /> Deactivate
              </button>
            ) : (
              <button
                className="secondary-button"
                onClick={() => updateMember(member.id, { status: 'active' })}
              >
                <RotateCcw size={15} /> Aktifkan
              </button>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );

  const renderQuota = () => (
    <div className="detail-grid">
      <SectionCard title="Saldo kuota">
        <div className="quota-three">
          <div>
            <span>Available</span>
            <strong>{quota?.unlimited ? '∞' : quota?.available ?? 0}</strong>
          </div>
          <div>
            <span>Reserved</span>
            <strong>{quota?.reserved ?? 0}</strong>
          </div>
          <div>
            <span>Consumed</span>
            <strong>{quota?.consumed ?? 0}</strong>
          </div>
        </div>
        <p className="muted-copy">
          {quota?.expiresAt
            ? `Berlaku sampai ${formatDate(quota.expiresAt)}`
            : 'Tidak ada tanggal kedaluwarsa.'}
        </p>
        <button className="secondary-button" onClick={() => setQuotaModal(true)}>
          <Plus size={15} /> Kelola kuota
        </button>
      </SectionCard>

      <SectionCard title="Riwayat ledger">
        <div className="timeline">
          {(quota?.history || []).length === 0 ? (
            <p className="muted-copy">Belum ada riwayat kuota.</p>
          ) : (
            quota.history.map((entry) => (
              <div className="timeline-item" key={entry.id}>
                <Badge status={entry.type} />
                <div>
                  <strong>{entry.description}</strong>
                  <span>{formatDate(entry.date)}</span>
                </div>
                {entry.quantity !== 0 && (
                  <span className={entry.quantity > 0 ? 'positive' : 'negative'}>
                    {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );

  const renderBookings = () => (
    <SectionCard title="Riwayat booking">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>TANGGAL</th>
              <th>JAM</th>
              <th>STATUS</th>
              <th>CATATAN</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {memberBookings.length === 0 ? (
              <tr>
                <td colSpan="5">Belum ada booking.</td>
              </tr>
            ) : (
              memberBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{formatDate(booking.date)}</td>
                  <td>{booking.start} - {booking.end}</td>
                  <td><Badge status={booking.status} /></td>
                  <td>{booking.note || '-'}</td>
                  <td>
                    <div className="table-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            className="action-button action-approve"
                            title="Approve"
                            aria-label="Approve booking"
                            onClick={() => approveBooking(booking.id)}
                          >
                            ✓
                          </button>
                          <button
                            className="action-button action-reject"
                            title="Reject"
                            aria-label="Reject booking"
                            onClick={() => rejectBooking(booking.id)}
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          className="action-button action-view"
                          title="Check in"
                          aria-label="Check in"
                          onClick={() => checkInBooking(booking.id)}
                        >
                          IN
                        </button>
                      )}
                      {['confirmed', 'checked_in'].includes(booking.status) && (
                        <button
                          className="action-button action-approve"
                          title="Complete"
                          aria-label="Complete session"
                          onClick={() => completeBooking(booking.id)}
                        >
                          ✓✓
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          className="action-button action-reject"
                          title="Cancel"
                          aria-label="Cancel booking"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );

  const renderWorkout = () => (
    <SectionCard
      title="Program latihan"
      action={
        <form className="inline-form" onSubmit={handleCreateProgram}>
          <input
            value={programTitle}
            onChange={(event) => setProgramTitle(event.target.value)}
            placeholder="Nama program baru"
            aria-label="Nama program baru"
          />
          <button className="primary-button" type="submit">
            <Plus size={15} /> Buat
          </button>
        </form>
      }
    >
      {memberPrograms.length === 0 ? (
        <p className="muted-copy">Belum ada program latihan untuk member ini.</p>
      ) : (
        <div className="program-list">
          {memberPrograms.map((program) => (
            <div className="program-item" key={program.id}>
              <div className="program-icon"><Dumbbell size={18} /></div>
              <div className="program-copy">
                <strong>{program.title}</strong>
                <span>
                  {formatDate(program.startDate)} - {formatDate(program.endDate)}
                </span>
              </div>
              <Badge status={program.isActive ? 'active' : 'inactive'}>
                {program.isActive ? 'Aktif' : 'Non-aktif'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );

  const renderProgress = () => (
    <div className="detail-grid">
      <SectionCard
        title="Grafik berat badan"
        action={
          <button className="text-button" onClick={() => setProgressModal(true)}>
            <Plus size={14} /> Tambah catatan
          </button>
        }
      >
        <ProgressChart data={memberProgress} field="weight" unit="kg" />
      </SectionCard>

      <SectionCard title="Catatan terbaru">
        <div className="timeline">
          {memberProgress.length === 0 ? (
            <p className="muted-copy">Belum ada catatan progress.</p>
          ) : (
            memberProgress.map((entry) => (
              <div className="timeline-item" key={entry.id}>
                <div className="timeline-dot" />
                <div>
                  <strong>{entry.weight ? `${entry.weight} kg` : '-'}</strong>
                  <span>{formatDate(entry.date)}</span>
                </div>
                <span className="muted-copy">
                  {entry.bodyFat ? `BF ${entry.bodyFat}%` : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );

  const renderActivity = () => (
    <SectionCard title="Aktivitas member">
      <div className="timeline">
        {memberBookings.length === 0 && (quota?.history || []).length === 0 ? (
          <p className="muted-copy">Belum ada aktivitas.</p>
        ) : (
          memberBookings.map((booking) => (
            <div className="timeline-item" key={booking.id}>
              <Badge status={booking.status} />
              <div>
                <strong>Sesi {formatDate(booking.date)}</strong>
                <span>{booking.start} - {booking.end}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );

  const renderers = {
    overview: renderOverview,
    quota: renderQuota,
    bookings: renderBookings,
    workout: renderWorkout,
    progress: renderProgress,
    activity: renderActivity,
  };

  return (
    <div className="page-container">
      <button className="back-button" onClick={() => navigate('/members')}>
        <ArrowLeft size={16} /> Kembali ke members
      </button>

      <div className="page-heading">
        <div>
          <span className="eyebrow">MEMBER DETAIL</span>
          <h1>{member.name}</h1>
          <p>{member.email}</p>
        </div>
        <div className="detail-heading-actions">
          <Badge status={member.status} />
          <button className="primary-button" onClick={() => setQuotaModal(true)}>
            <Plus size={17} /> Kelola kuota
          </button>
        </div>
      </div>

      <div className="detail-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`detail-tab ${activeTab === tab.id ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderers[activeTab]()}

      <QuotaAdjustModal
        open={quotaModal}
        onClose={() => setQuotaModal(false)}
        member={member}
        onSubmit={handleQuotaSubmit}
      />

      <MemberFormModal
        open={editModal}
        onClose={() => setEditModal(false)}
        member={member}
        onSubmit={async (values) => {
          await updateMember(member.id, {
            name: values.name,
            goal: values.goal,
            phone: values.phone,
            notes: values.notes,
            height: values.height ? Number(values.height) : null,
            birthDate: values.birthDate || null,
          });
          setEditModal(false);
        }}
      />

      <Modal
        open={progressModal}
        onClose={() => setProgressModal(false)}
        title="Tambah catatan progress"
        footer={
          <>
            <button className="secondary-button" onClick={() => setProgressModal(false)}>
              Batal
            </button>
            <button className="primary-button" type="submit" form="progress-form">
              Simpan
            </button>
          </>
        }
      >
        <form id="progress-form" className="form-grid" onSubmit={handleProgressSubmit}>
          <Field label="Berat badan (kg)" hint="Opsional">
            <input
              type="number"
              step="0.1"
              value={progressValues.weight}
              onChange={(event) => setProgressValues((current) => ({ ...current, weight: event.target.value }))}
            />
          </Field>
          <Field label="Body fat (%)" hint="Opsional">
            <input
              type="number"
              step="0.1"
              value={progressValues.bodyFat}
              onChange={(event) => setProgressValues((current) => ({ ...current, bodyFat: event.target.value }))}
            />
          </Field>
          <Field label="Lingkar pinggang (cm)" hint="Opsional">
            <input
              type="number"
              step="0.1"
              value={progressValues.waist}
              onChange={(event) => setProgressValues((current) => ({ ...current, waist: event.target.value }))}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
