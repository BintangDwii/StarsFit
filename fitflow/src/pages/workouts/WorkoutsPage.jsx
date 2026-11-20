import { useMemo, useState } from 'react';
import { ChevronDown, Dumbbell, Plus } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import Field from '../../components/ui/Field';
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

export default function WorkoutsPage() {
  const { members, programs, createProgram } = useWorkspace();

  const [memberFilter, setMemberFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState({
    memberId: members[0]?.id || '',
    title: '',
  });
  const [error, setError] = useState('');

  const filtered = useMemo(
    () =>
      programs.filter(
        (program) =>
          memberFilter === 'all' || program.memberId === memberFilter
      ),
    [programs, memberFilter]
  );

  const memberName = (id) =>
    members.find((member) => member.id === id)?.name || 'Member';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (values.title.trim().length < 3) {
      setError('Judul program minimal 3 karakter.');
      return;
    }

    await createProgram(values.memberId, values.title.trim());
    setValues((current) => ({ ...current, title: '' }));
    setError('');
    setFormOpen(false);
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">COACHING</span>
          <h1>Workout Programs</h1>
          <p>Buat dan kelola program latihan untuk setiap member.</p>
        </div>
        <button className="primary-button" onClick={() => setFormOpen(true)}>
          <Plus size={17} /> New program
        </button>
      </div>

      <section className="card">
        <div className="toolbar">
          <select
            className="filter-select"
            value={memberFilter}
            onChange={(event) => setMemberFilter(event.target.value)}
            aria-label="Filter member"
          >
            <option value="all">Semua member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <span className="toolbar-count">{filtered.length} program</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Belum ada program</h3>
            <p>Buat program pertama untuk member yang dipilih.</p>
          </div>
        ) : (
          <div className="program-list program-list--page">
            {filtered.map((program) => (
              <div className="program-card" key={program.id}>
                <button
                  className="program-card-head"
                  onClick={() =>
                    setExpanded((current) =>
                      current === program.id ? null : program.id
                    )
                  }
                >
                  <div className="program-icon"><Dumbbell size={18} /></div>
                  <div className="program-copy">
                    <strong>{program.title}</strong>
                    <span>
                      {memberName(program.memberId)} · {formatDate(program.startDate)} - {formatDate(program.endDate)}
                    </span>
                  </div>
                  <Badge status={program.isActive ? 'active' : 'inactive'}>
                    {program.isActive ? 'Aktif' : 'Non-aktif'}
                  </Badge>
                  <ChevronDown
                    size={17}
                    className={expanded === program.id ? 'rotate' : ''}
                  />
                </button>

                {expanded === program.id && (
                  <div className="program-card-body">
                    {!program.days || program.days.length === 0 ? (
                      <p className="muted-copy">
                        Belum ada hari latihan pada program ini.
                      </p>
                    ) : (
                      program.days.map((day) => (
                        <div className="program-day" key={day.id}>
                          <strong>{day.dayName}</strong>
                          <div className="exercise-list">
                            {day.exercises.map((exercise) => (
                              <div className="exercise-row" key={exercise.id}>
                                <span>{exercise.name}</span>
                                <span>
                                  {exercise.sets} × {exercise.reps}
                                  {exercise.targetWeight ? ` · ${exercise.targetWeight} kg` : ''}
                                  {` · rest ${exercise.restSeconds}s`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Program latihan baru"
        description="Program baru akan terhubung ke member yang dipilih."
        footer={
          <>
            <button className="secondary-button" onClick={() => setFormOpen(false)}>Batal</button>
            <button className="primary-button" type="submit" form="program-form">Buat program</button>
          </>
        }
      >
        <form id="program-form" className="form-grid" onSubmit={handleSubmit}>
          <Field label="Member" required>
            <select
              value={values.memberId}
              onChange={(event) => setValues((current) => ({ ...current, memberId: event.target.value }))}
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </Field>

          <div className="field-full">
            <Field label="Judul program" error={error} required>
              <input
                value={values.title}
                onChange={(event) => {
                  setValues((current) => ({ ...current, title: event.target.value }));
                  setError('');
                }}
                placeholder="Mis. Fat Loss Phase 2"
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
