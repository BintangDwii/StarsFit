import { Database, ShieldCheck, UserRound, Users } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import { useWorkspace } from '../../hooks/useWorkspace';

export default function SettingsPage() {
  const { workspace, demoMode, members, bookings, notifications } = useWorkspace();

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SYSTEM</span>
          <h1>Settings</h1>
          <p>Konfigurasi workspace dan status integrasi data.</p>
        </div>
      </div>

      <div className="detail-grid">
        <section className="card detail-card">
          <div className="section-header">
            <h2>Workspace</h2>
            <Badge status="active">Aktif</Badge>
          </div>
          <div className="info-list">
            <div className="info-row">
              <div className="info-label"><Users size={15} /><span>Nama</span></div>
              <strong>{workspace.name}</strong>
            </div>
            <div className="info-row">
              <div className="info-label"><Database size={15} /><span>Tipe</span></div>
              <strong>{workspace.studio}</strong>
            </div>
            <div className="info-row">
              <div className="info-label"><ShieldCheck size={15} /><span>Timezone</span></div>
              <strong>{workspace.timezone}</strong>
            </div>
            <div className="info-row">
              <div className="info-label"><Database size={15} /><span>Tenant ID</span></div>
              <strong className="mono">{workspace.id}</strong>
            </div>
          </div>
        </section>

        <section className="card detail-card">
          <div className="section-header"><h2>Profil trainer</h2></div>
          <div className="profile-block">
            <div className="profile-avatar">BK</div>
            <div>
              <h3>{workspace.trainer}</h3>
              <p>{workspace.role}</p>
              <Badge status="active">Owner</Badge>
            </div>
          </div>
        </section>
      </div>

      <section className="card detail-card">
        <div className="section-header"><h2>Status integrasi</h2></div>
        <div className="integration-status">
          <div className="integration-item">
            <div className={`integration-icon ${demoMode ? 'is-demo' : ''}`}>
              <Database size={18} />
            </div>
            <div>
              <strong>{demoMode ? 'Demo mode' : 'Supabase connected'}</strong>
              <span>
                {demoMode
                  ? 'Data berasal dari mock data lokal. Salin .env.example ke .env dan isi kredensial Supabase untuk beralih.'
                  : 'Mutasi memanggil RPC dan data dimuat ulang otomatis.'}
              </span>
            </div>
            <Badge status={demoMode ? 'pending' : 'active'}>
              {demoMode ? 'Mock' : 'Live'}
            </Badge>
          </div>

          <div className="integration-item">
            <div className="integration-icon"><UserRound size={18} /></div>
            <div>
              <strong>Ringkasan data</strong>
              <span>{members.length} member · {bookings.length} booking · {notifications.length} notifikasi</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card detail-card danger-zone">
        <div className="section-header"><h2>Area sensitif</h2></div>
        <p className="muted-copy">
          Penghapusan workspace, manajemen role, dan rotasi kunci hanya tersedia
          setelah backend multi-tenant dan audit log aktif.
        </p>
        <div className="quick-actions">
          <button className="secondary-button" disabled>Hapus workspace</button>
          <button className="secondary-button" disabled>Kelola akses</button>
        </div>
      </section>
    </div>
  );
}
