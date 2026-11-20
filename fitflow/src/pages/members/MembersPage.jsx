import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, LogOut, Pencil, Plus, Search, Users } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import MemberFormModal from '../../components/members/MemberFormModal';
import Modal from '../../components/ui/Modal';
import { useWorkspace } from '../../hooks/useWorkspace';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function QuotaCell({ member }) {
  const quota = member.quota;

  if (!quota) return <span className="text-muted">Belum ada kuota</span>;

  return (
    <div className="quota-cell">
      <div className="quota-cell-numbers">
        <strong>{quota.unlimited ? '∞' : quota.available}</strong>
        <span>/ {quota.unlimited ? 'Unlimited' : quota.total}</span>
      </div>
      <div className="quota-progress-track quota-progress-track--small">
        <div
          className={`quota-progress-fill ${quota.available <= 2 && !quota.unlimited ? 'quota-progress-fill--low' : ''}`}
          style={{
            width: `${quota.unlimited ? 100 : Math.min(100, (quota.available / Math.max(1, quota.total)) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function MembersPage() {
  const navigate = useNavigate();
  const { members, addMember, updateMember, deactivateMember } = useWorkspace();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(null);

  const goals = useMemo(
    () => [...new Set(members.map((member) => member.goal).filter(Boolean))],
    [members]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesQuery =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === 'all' || member.status === statusFilter;
      const matchesGoal = goalFilter === 'all' || member.goal === goalFilter;

      return matchesQuery && matchesStatus && matchesGoal;
    });
  }, [members, search, statusFilter, goalFilter]);

  const handleCreate = async (values) => {
    await addMember(values);
    setAddOpen(false);
  };

  const handleEdit = async (values) => {
    await updateMember(editing.id, {
      name: values.name,
      goal: values.goal,
      phone: values.phone,
      notes: values.notes,
      height: values.height ? Number(values.height) : null,
      birthDate: values.birthDate || null,
    });
    setEditing(null);
  };

  const handleDeactivate = async () => {
    await deactivateMember(confirming.id);
    setConfirming(null);
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MANAGEMENT</span>
          <h1>Members</h1>
          <p>Kelola member, kuota, dan program latihan dalam satu tempat.</p>
        </div>
        <button className="primary-button" onClick={() => setAddOpen(true)}>
          <Plus size={17} />
          Add member
        </button>
      </div>

      <section className="mini-stats-grid">
        <div className="card mini-stat">
          <div className="mini-stat-icon mini-stat-icon--blue">
            <Users size={18} />
          </div>
          <div>
            <span>Total members</span>
            <strong>{members.length}</strong>
          </div>
        </div>
        <div className="card mini-stat">
          <div>
            <span>Active</span>
            <strong>{members.filter((item) => item.status === 'active').length}</strong>
          </div>
        </div>
        <div className="card mini-stat">
          <div>
            <span>Low quota</span>
            <strong>
              {
                members.filter(
                  (item) =>
                    item.quota &&
                    !item.quota.unlimited &&
                    item.quota.available <= 2
                ).length
              }
            </strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="toolbar">
          <label className="search-input">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama atau email..."
              aria-label="Cari member"
            />
          </label>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter status"
          >
            <option value="all">Semua status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className="filter-select"
            value={goalFilter}
            onChange={(event) => setGoalFilter(event.target.value)}
            aria-label="Filter tujuan"
          >
            <option value="all">Semua tujuan</option>
            {goals.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>

          <span className="toolbar-count">{filtered.length} member</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Tidak ada member</h3>
            <p>Coba ubah kata kunci atau filter pencarian.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper members-table-view">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>MEMBER</th>
                    <th>STATUS</th>
                    <th>GOAL</th>
                    <th>QUOTA</th>
                    <th>JOINED</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr
                      key={member.id}
                      className="clickable-row"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      <td>
                        <div className="table-member">
                          <div className="member-avatar">{member.initials}</div>
                          <div className="table-member-copy">
                            <strong>{member.name}</strong>
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><Badge status={member.status} /></td>
                      <td>{member.goal || '-'}</td>
                      <td><QuotaCell member={member} /></td>
                      <td>{formatDate(member.joinedAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-button action-view"
                            title="Lihat detail"
                            aria-label={`Lihat ${member.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/members/${member.id}`);
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="action-button action-edit"
                            title="Edit"
                            aria-label={`Edit ${member.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditing(member);
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                          {member.status === 'active' && (
                            <button
                              className="action-button action-reject"
                              title="Deactivate"
                              aria-label={`Deactivate ${member.name}`}
                              onClick={(event) => {
                                event.stopPropagation();
                                setConfirming(member);
                              }}
                            >
                              <LogOut size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="members-card-view">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  className="member-list-card"
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <div className="member-avatar">{member.initials}</div>
                  <div className="member-list-copy">
                    <strong>{member.name}</strong>
                    <span>{member.goal || '-'}</span>
                    <QuotaCell member={member} />
                  </div>
                  <Badge status={member.status} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <MemberFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
      />

      <MemberFormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        member={editing}
        onSubmit={handleEdit}
      />

      <Modal
        open={Boolean(confirming)}
        onClose={() => setConfirming(null)}
        title="Deactivate member?"
        description={`${confirming?.name || ''} tidak bisa booking sesi sampai statusnya diaktifkan kembali.`}
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setConfirming(null)}
            >
              Batal
            </button>
            <button className="danger-button" onClick={handleDeactivate}>
              Deactivate
            </button>
          </>
        }
      >
        <p className="modal-note">
          Kuota dan riwayat member tetap tersimpan. Aksi ini dapat dibatalkan
          dari halaman detail member.
        </p>
      </Modal>
    </div>
  );
}
