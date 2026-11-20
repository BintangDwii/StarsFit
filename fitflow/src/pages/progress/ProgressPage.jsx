import { useMemo, useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';

import Field from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import ProgressChart from '../../components/progress/ProgressChart';
import { useWorkspace } from '../../hooks/useWorkspace';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const emptyRecord = { weight: '', bodyFat: '', waist: '', chest: '', arm: '' };

export default function ProgressPage() {
  const { members, progress, addProgress } = useWorkspace();

  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [values, setValues] = useState(emptyRecord);

  const records = useMemo(() => progress[memberId] || [], [progress, memberId]);

  const latest = records[0];
  const first = records[records.length - 1];
  const delta =
    latest?.weight && first?.weight
      ? (latest.weight - first.weight).toFixed(1)
      : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addProgress(memberId, values);
    setValues(emptyRecord);
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">COACHING</span>
          <h1>Progress Tracking</h1>
          <p>Pantau perkembangan tubuh member dari waktu ke waktu.</p>
        </div>
        <button className="primary-button" onClick={() => setModalOpen(true)}>
          <Plus size={17} /> Add record
        </button>
      </div>

      <section className="card">
        <div className="toolbar">
          <select
            className="filter-select"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            aria-label="Pilih member"
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>

          <div className="progress-highlight">
            <TrendingUp size={16} />
            <span>Berat terakhir</span>
            <strong>{latest?.weight ? `${latest.weight} kg` : '-'}</strong>
            {delta && (
              <span className={Number(delta) <= 0 ? 'positive' : 'negative'}>
                {Number(delta) > 0 ? '+' : ''}{delta} kg
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="card chart-card">
          <div className="section-header"><h2>Berat badan</h2></div>
          <ProgressChart data={records} field="weight" unit="kg" />
        </section>

        <section className="card chart-card">
          <div className="section-header"><h2>Body fat</h2></div>
          <ProgressChart data={records} field="bodyFat" unit="%" color="#E99A24" />
        </section>
      </div>

      <section className="card">
        <div className="section-header"><h2>Riwayat catatan</h2></div>
        {records.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada catatan</h3>
            <p>Tambahkan catatan progress pertama untuk member ini.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TANGGAL</th>
                  <th>BERAT</th>
                  <th>BODY FAT</th>
                  <th>PINGGANG</th>
                  <th>DADA</th>
                  <th>LENGAN</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.weight ? `${record.weight} kg` : '-'}</td>
                    <td>{record.bodyFat ? `${record.bodyFat}%` : '-'}</td>
                    <td>{record.waist ? `${record.waist} cm` : '-'}</td>
                    <td>{record.chest ? `${record.chest} cm` : '-'}</td>
                    <td>{record.arm ? `${record.arm} cm` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tambah catatan progress"
        description="Isi hanya data yang tersedia."
        footer={
          <>
            <button className="secondary-button" onClick={() => setModalOpen(false)}>Batal</button>
            <button className="primary-button" type="submit" form="progress-record-form">Simpan</button>
          </>
        }
      >
        <form id="progress-record-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Berat badan (kg)">
            <input type="number" step="0.1" value={values.weight} onChange={(event) => setValues((current) => ({ ...current, weight: event.target.value }))} />
          </Field>
          <Field label="Body fat (%)">
            <input type="number" step="0.1" value={values.bodyFat} onChange={(event) => setValues((current) => ({ ...current, bodyFat: event.target.value }))} />
          </Field>
          <Field label="Lingkar pinggang (cm)">
            <input type="number" step="0.1" value={values.waist} onChange={(event) => setValues((current) => ({ ...current, waist: event.target.value }))} />
          </Field>
          <Field label="Lingkar dada (cm)">
            <input type="number" step="0.1" value={values.chest} onChange={(event) => setValues((current) => ({ ...current, chest: event.target.value }))} />
          </Field>
          <Field label="Lingkar lengan (cm)">
            <input type="number" step="0.1" value={values.arm} onChange={(event) => setValues((current) => ({ ...current, arm: event.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
