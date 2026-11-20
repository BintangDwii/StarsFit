import { Dumbbell } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import { usePortal } from '../../hooks/usePortal';
import { useWorkspace } from '../../hooks/useWorkspace';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function MemberWorkoutPage() {
  const { memberId } = usePortal();
  const { programs } = useWorkspace();

  const myPrograms = programs.filter((program) => program.memberId === memberId);

  return (
    <div className="portal-page">
      <div className="portal-greeting">
        <span>WORKOUT</span>
        <h1>Program Latihan</h1>
        <p>Program yang disusun trainer untukmu.</p>
      </div>

      {myPrograms.length === 0 ? (
        <div className="portal-card">
          <p className="muted-copy">Belum ada program latihan.</p>
        </div>
      ) : (
        myPrograms.map((program) => (
          <section className="portal-section" key={program.id}>
            <div className="portal-card">
              <div className="portal-card-row">
                <div className="portal-icon"><Dumbbell size={18} /></div>
                <div>
                  <strong>{program.title}</strong>
                  <span>{formatDate(program.startDate)} - {formatDate(program.endDate)}</span>
                </div>
                <Badge status={program.isActive ? 'active' : 'inactive'}>
                  {program.isActive ? 'Aktif' : 'Selesai'}
                </Badge>
              </div>

              {(program.days || []).map((day) => (
                <div className="portal-program-day" key={day.id}>
                  <strong>{day.dayName}</strong>
                  {day.exercises.map((exercise) => (
                    <div className="exercise-row" key={exercise.id}>
                      <span>{exercise.name}</span>
                      <span>{exercise.sets} × {exercise.reps}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
