import { useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';

import Field from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import ProgressChart from '../../components/progress/ProgressChart';
import { usePortal } from '../../hooks/usePortal';
import { useWorkspace } from '../../hooks/useWorkspace';

export default function MemberProgressPage() {
  const { memberId } = usePortal();
  const { progress, addProgress } = useWorkspace();

  const [modalOpen, setModalOpen] = useState(false);
  const [values, setValues] = useState({
    weight: '',
    bodyFat: '',
    waist: '',
  });

  const records = progress[memberId] || [];

  return (
    <div className="portal-page">
      <div className="portal-greeting">
        <span>PROGRESS</span>
        <h1>Perkembanganmu</h1>
        <p>Data terakhir dari catatan trainer dan catatanmu sendiri.</p>
        <button
          className="portal-primary-button portal-progress-add"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} /> Tambah catatan
        </button>
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Catatan progress"
        description="Isi data yang ingin kamu catat hari ini."
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </button>
            <button
              className="primary-button"
              type="submit"
              form="member-progress-form"
            >
              Simpan
            </button>
          </>
        }
      >
        <form
          id="member-progress-form"
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            await addProgress(memberId, values);
            setValues({ weight: '', bodyFat: '', waist: '' });
            setModalOpen(false);
          }}
        >
          <Field label="Berat badan (kg)">
            <input
              type="number"
              step="0.1"
              value={values.weight}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  weight: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Body fat (%)">
            <input
              type="number"
              step="0.1"
              value={values.bodyFat}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  bodyFat: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Lingkar pinggang (cm)">
            <input
              type="number"
              step="0.1"
              value={values.waist}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  waist: event.target.value,
                }))
              }
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
