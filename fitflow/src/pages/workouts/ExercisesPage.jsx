import { useMemo, useState } from 'react';
import { Dumbbell, Plus, Search } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import Field from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import { useWorkspace } from '../../hooks/useWorkspace';

const emptyForm = {
  name: '',
  muscleGroup: '',
  equipment: '',
  description: '',
};

export default function ExercisesPage() {
  const { exercises, createExercise } = useWorkspace();

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState(emptyForm);
  const [error, setError] = useState('');

  const groups = useMemo(
    () =>
      [
        ...new Set(
          exercises.map((item) => item.muscleGroup).filter(Boolean)
        ),
      ].sort(),
    [exercises]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exercises.filter((item) => {
      const matchesQuery =
        !query || item.name.toLowerCase().includes(query);
      const matchesGroup =
        groupFilter === 'all' || item.muscleGroup === groupFilter;

      return matchesQuery && matchesGroup;
    });
  }, [exercises, search, groupFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (values.name.trim().length < 2) {
      setError('Nama exercise minimal 2 karakter.');
      return;
    }

    await createExercise({
      ...values,
      name: values.name.trim(),
    });
    setValues(emptyForm);
    setError('');
    setFormOpen(false);
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">COACHING</span>
          <h1>Exercise Library</h1>
          <p>
            Pustaka gerakan global dan exercise khusus studio Anda.
          </p>
        </div>
        <button className="primary-button" onClick={() => setFormOpen(true)}>
          <Plus size={17} /> Add exercise
        </button>
      </div>

      <section className="card">
        <div className="toolbar">
          <label className="search-input">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari exercise..."
              aria-label="Cari exercise"
            />
          </label>
          <select
            className="filter-select"
            value={groupFilter}
            onChange={(event) => setGroupFilter(event.target.value)}
            aria-label="Filter otot"
          >
            <option value="all">Semua otot</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <span className="toolbar-count">{filtered.length} exercise</span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>NAMA</th>
                <th>OTOT</th>
                <th>EQUIPMENT</th>
                <th>SCOPE</th>
                <th>DESKRIPSI</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5">Tidak ada exercise.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-member">
                        <div className="program-icon"><Dumbbell size={15} /></div>
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>{item.muscleGroup || '-'}</td>
                    <td>{item.equipment || '-'}</td>
                    <td>
                      <Badge status={item.isGlobal ? 'info' : 'active'}>
                        {item.isGlobal ? 'Global' : 'Studio'}
                      </Badge>
                    </td>
                    <td>{item.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Exercise baru"
        description="Exercise akan tersimpan di studio workspace ini."
        footer={
          <>
            <button className="secondary-button" onClick={() => setFormOpen(false)}>
              Batal
            </button>
            <button className="primary-button" type="submit" form="exercise-form">
              Simpan
            </button>
          </>
        }
      >
        <form id="exercise-form" className="form-grid" onSubmit={handleSubmit}>
          <div className="field-full">
            <Field label="Nama exercise" error={error} required>
              <input
                value={values.name}
                onChange={(event) => {
                  setValues((current) => ({ ...current, name: event.target.value }));
                  setError('');
                }}
                placeholder="Mis. Cable Row"
              />
            </Field>
          </div>
          <Field label="Kelompok otot">
            <input
              value={values.muscleGroup}
              onChange={(event) =>
                setValues((current) => ({ ...current, muscleGroup: event.target.value }))
              }
              placeholder="Back"
            />
          </Field>
          <Field label="Equipment">
            <input
              value={values.equipment}
              onChange={(event) =>
                setValues((current) => ({ ...current, equipment: event.target.value }))
              }
              placeholder="Cable"
            />
          </Field>
          <div className="field-full">
            <Field label="Deskripsi">
              <textarea
                rows={2}
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Opsional"
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
