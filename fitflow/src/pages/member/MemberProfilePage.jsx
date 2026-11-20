import { LogOut } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { usePortal } from '../../hooks/usePortal';
import { useWorkspace } from '../../hooks/useWorkspace';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default function MemberProfilePage() {
  const { memberId, setMemberId } = usePortal();
  const { members, demoMode } = useWorkspace();
  const { signOut } = useAuth();

  const member = members.find((item) => item.id === memberId) || members[0];

  return (
    <div className="portal-page">
      <div className="portal-greeting">
        <span>PROFILE</span>
        <h1>Profil Saya</h1>
      </div>

      <section className="portal-card portal-profile-card">
        <div className="member-avatar member-avatar--xl">{member?.initials}</div>
        <h2>{member?.name}</h2>
        <p>{member?.email}</p>
        <Badge status={member?.status || 'active'} />
      </section>

      <section className="portal-section">
        <h2>Informasi</h2>
        <div className="portal-card">
          <div className="info-row"><div className="info-label"><span>Tujuan</span></div><strong>{member?.goal}</strong></div>
          <div className="info-row"><div className="info-label"><span>Telepon</span></div><strong>{member?.phone || '-'}</strong></div>
          <div className="info-row"><div className="info-label"><span>Tinggi badan</span></div><strong>{member?.height ? `${member.height} cm` : '-'}</strong></div>
          <div className="info-row"><div className="info-label"><span>Bergabung</span></div><strong>{formatDate(member?.joinedAt)}</strong></div>
        </div>
      </section>

      {demoMode && (
        <section className="portal-section">
          <h2>Member demo</h2>
          <select
            className="portal-input"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
          >
            {members.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <p className="portal-note">
            Pilih member untuk mencoba portal tanpa login. Data berasal dari mock data.
          </p>
        </section>
      )}

      {demoMode ? (
        <button className="portal-secondary-button" disabled>
          <LogOut size={16} /> Keluar (tersedia setelah auth)
        </button>
      ) : (
        <button className="portal-secondary-button" onClick={signOut}>
          <LogOut size={16} /> Keluar
        </button>
      )}
    </div>
  );
}
