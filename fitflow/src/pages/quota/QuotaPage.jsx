import { useMemo, useState } from 'react';
import { AlertCircle, Layers3, Search, SlidersHorizontal } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import QuotaAdjustModal from '../../components/quota/QuotaAdjustModal';
import QuotaHistoryModal from '../../components/quota/QuotaHistoryModal';
import { useWorkspace } from '../../hooks/useWorkspace';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function QuotaPage() {
  const {
    members,
    adjustQuota,
    createQuota,
    setUnlimitedQuota,
  } = useWorkspace();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const withQuota = useMemo(
    () => members.filter((member) => member.quota),
    [members]
  );

  const totals = useMemo(
    () =>
      withQuota.reduce(
        (acc, member) => ({
          available: acc.available + (member.quota.unlimited ? 0 : member.quota.available),
          reserved: acc.reserved + member.quota.reserved,
          consumed: acc.consumed + member.quota.consumed,
        }),
        { available: 0, reserved: 0, consumed: 0 }
      ),
    [withQuota]
  );

  const lowQuota = useMemo(
    () =>
      withQuota.filter(
        (member) =>
          member.status === 'active' &&
          !member.quota.unlimited &&
          member.quota.available <= 2
      ),
    [withQuota]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return withQuota.filter((member) => {
      const matchesQuery =
        !query || member.name.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'low' && !member.quota.unlimited && member.quota.available <= 2) ||
        (filter === 'unlimited' && member.quota.unlimited) ||
        (filter === 'expired' && member.quota.status === 'expired');

      return matchesQuery && matchesFilter;
    });
  }, [withQuota, search, filter]);

  const handleSubmit = async (values) => {
    if (values.mode === 'adjust') {
      await adjustQuota(adjustTarget.id, values.delta, values.description);
    } else {
      await createQuota(adjustTarget.id, values);
    }
    setAdjustTarget(null);
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">MANAGEMENT</span>
          <h1>Quota Management</h1>
          <p>Pantau dan kelola sesi latihan setiap member.</p>
        </div>
      </div>

      <section className="stats-grid">
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Available</span>
            <div className="stat-icon stat-icon--blue"><Layers3 size={20} /></div>
          </div>
          <div className="stat-value">{totals.available}</div>
          <div className="stat-footer">
            <span>Sesi siap dipakai</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Reserved</span>
            <div className="stat-icon stat-icon--orange"><SlidersHorizontal size={20} /></div>
          </div>
          <div className="stat-value">{totals.reserved}</div>
          <div className="stat-footer"><span>Booking aktif</span></div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Consumed</span>
            <div className="stat-icon stat-icon--green"><Layers3 size={20} /></div>
          </div>
          <div className="stat-value">{totals.consumed}</div>
          <div className="stat-footer"><span>Sesi terpakai</span></div>
        </div>
        <div className="card stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Low quota</span>
            <div className="stat-icon stat-icon--red"><AlertCircle size={20} /></div>
          </div>
          <div className="stat-value">{lowQuota.length}</div>
          <div className="stat-footer"><span>Perlu perhatian</span></div>
        </div>
      </section>

      {lowQuota.length > 0 && (
        <section className="card alert-card">
          <div className="alert-card-icon"><AlertCircle size={18} /></div>
          <div className="alert-card-copy">
            <strong>{lowQuota.length} member hampir kehabisan kuota</strong>
            <span>
              {lowQuota.map((member) => member.name).join(', ')}
            </span>
          </div>
          <button
            className="secondary-button"
            onClick={() => setFilter('low')}
          >
            Lihat
          </button>
        </section>
      )}

      <section className="card">
        <div className="toolbar">
          <label className="search-input">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari member..."
              aria-label="Cari member"
            />
          </label>
          <select
            className="filter-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter kuota"
          >
            <option value="all">Semua kuota</option>
            <option value="low">Sisa ≤ 2 sesi</option>
            <option value="unlimited">Unlimited</option>
            <option value="expired">Expired</option>
          </select>
          <span className="toolbar-count">{filtered.length} member</span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>MEMBER</th>
                <th>STATUS</th>
                <th>AVAILABLE</th>
                <th>RESERVED</th>
                <th>CONSUMED</th>
                <th>EXPIRY</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7">Tidak ada data kuota.</td></tr>
              ) : (
                filtered.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="table-member">
                        <div className="member-avatar">{member.initials}</div>
                        <div className="table-member-copy">
                          <strong>{member.name}</strong>
                          <span>{member.goal}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-badges">
                        <Badge status={member.quota.status || 'active'} />
                        {member.quota.unlimited && <Badge status="info">Unlimited</Badge>}
                      </div>
                    </td>
                    <td>
                      <strong className={member.quota.available <= 2 && !member.quota.unlimited ? 'negative' : ''}>
                        {member.quota.unlimited ? '∞' : member.quota.available}
                      </strong>
                    </td>
                    <td>{member.quota.reserved}</td>
                    <td>{member.quota.consumed}</td>
                    <td>{formatDate(member.quota.expiresAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-button action-approve"
                          title="Adjust"
                          aria-label={`Adjust kuota ${member.name}`}
                          onClick={() => setAdjustTarget(member)}
                        >
                          +
                        </button>
                        <button
                          className="action-button action-view"
                          title="Riwayat"
                          aria-label={`Riwayat kuota ${member.name}`}
                          onClick={() => setHistoryTarget(member)}
                        >
                          ≡
                        </button>
                        <button
                          className="action-button action-edit"
                          title="Toggle unlimited"
                          aria-label={`Ubah unlimited ${member.name}`}
                          onClick={() => setUnlimitedQuota(member.id, !member.quota.unlimited)}
                        >
                          ∞
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <QuotaAdjustModal
        open={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        member={adjustTarget}
        onSubmit={handleSubmit}
      />

      <QuotaHistoryModal
        open={Boolean(historyTarget)}
        onClose={() => setHistoryTarget(null)}
        member={historyTarget}
      />
    </div>
  );
}
