import { TrendingUp } from 'lucide-react';

import ProgressChart from '../../components/progress/ProgressChart';
import { usePortal } from '../../hooks/usePortal';
import { useWorkspace } from '../../hooks/useWorkspace';

export default function MemberProgressPage() {
  const { memberId } = usePortal();
  const { progress } = useWorkspace();

  const records = progress[memberId] || [];

  return (
    <div className="portal-page">
      <div className="portal-greeting">
        <span>PROGRESS</span>
        <h1>Perkembanganmu</h1>
        <p>Data terakhir dari catatan trainer.</p>
      </div>

      <section className="portal-card portal-chart-card">
        <div className="portal-card-row">
          <div className="portal-icon"><TrendingUp size={18} /></div>
          <div>
            <strong>Berat badan</strong>
            <span>{records.length} catatan</span>
          </div>
        </div>
        <ProgressChart data={records} field="weight" unit="kg" />
      </section>

      <section className="portal-card portal-chart-card">
        <div className="portal-card-row">
          <div className="portal-icon"><TrendingUp size={18} /></div>
          <div><strong>Body fat</strong></div>
        </div>
        <ProgressChart data={records} field="bodyFat" unit="%" color="#E99A24" />
      </section>

      {records.length > 0 && (
        <section className="portal-section">
          <h2>Riwayat</h2>
          {records.map((record) => (
            <div className="portal-card portal-progress-row" key={record.id}>
              <span>
                {new Date(record.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <strong>{record.weight} kg</strong>
              {record.bodyFat && <span>BF {record.bodyFat}%</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
