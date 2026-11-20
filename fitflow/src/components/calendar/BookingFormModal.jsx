import { useState } from 'react';
import { z } from 'zod';

import Field from '../ui/Field';
import Modal from '../ui/Modal';
import { toISO } from '../../lib/dates';

const TODAY_ISO = toISO(new Date());

const schema = z.object({
  memberId: z.string().min(1, 'Pilih member.'),
  date: z.string().min(1, 'Pilih tanggal.'),
  start: z.string().regex(/^\d{2}:\d{2}$/, 'Jam tidak valid.'),
  duration: z.coerce.number().int().min(30).max(180),
  note: z.string(),
});

const addMinutes = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default function BookingFormModal({ open, onClose, members, onSubmit, initialDate }) {
  const [values, setValues] = useState({
    memberId: members[0]?.id || '',
    date: initialDate || TODAY_ISO,
    start: '09:00',
    duration: '60',
    note: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = schema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    onSubmit({
      memberId: result.data.memberId,
      date: result.data.date,
      start: result.data.start,
      end: addMinutes(result.data.start, result.data.duration),
      note: result.data.note,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Booking baru"
      description="Buat pengajuan sesi latihan untuk member."
      footer={
        <>
          <button className="secondary-button" onClick={onClose}>Batal</button>
          <button className="primary-button" type="submit" form="booking-form">
            Buat booking
          </button>
        </>
      }
    >
      <form id="booking-form" className="form-grid" onSubmit={handleSubmit}>
        <div className="field-full">
          <Field label="Member" error={errors.memberId?.[0]} required>
            <select value={values.memberId} onChange={(event) => set('memberId', event.target.value)}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.quota?.unlimited ? 'Unlimited' : `${member.quota?.available ?? 0} sesi`}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tanggal" error={errors.date?.[0]} required>
          <input type="date" value={values.date} onChange={(event) => set('date', event.target.value)} />
        </Field>

        <Field label="Jam mulai" error={errors.start?.[0]} required>
          <input type="time" value={values.start} onChange={(event) => set('start', event.target.value)} />
        </Field>

        <Field label="Durasi (menit)" error={errors.duration?.[0]} required>
          <select value={values.duration} onChange={(event) => set('duration', event.target.value)}>
            <option value="30">30 menit</option>
            <option value="60">60 menit</option>
            <option value="90">90 menit</option>
            <option value="120">120 menit</option>
          </select>
        </Field>

        <div className="field-full">
          <Field label="Catatan member" error={errors.note?.[0]}>
            <textarea
              rows={2}
              value={values.note}
              onChange={(event) => set('note', event.target.value)}
              placeholder="Opsional"
            />
          </Field>
        </div>
      </form>
    </Modal>
  );
}
