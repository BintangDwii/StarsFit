import { useState } from 'react';
import { z } from 'zod';

import Field from '../ui/Field';
import Modal from '../ui/Modal';

const createSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.'),
  email: z.string().trim().email('Format email tidak valid.'),
  goal: z.string(),
  phone: z.string(),
  quantity: z.coerce
    .number({ message: 'Jumlah kuota harus angka.' })
    .int('Harus bilangan bulat.')
    .min(1, 'Minimal 1 sesi.')
    .max(1000, 'Maksimal 1000 sesi.'),
  expiresAt: z.string(),
  unlimited: z.boolean(),
});

const editSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.'),
  goal: z.string(),
  phone: z.string(),
  notes: z.string(),
  height: z.string(),
  birthDate: z.string(),
});

const goals = [
  'Fat Loss',
  'Muscle Building',
  'Strength Training',
  'Full Body Workout',
  'Rehab',
  'General Fitness',
];

const initialCreate = {
  name: '',
  email: '',
  goal: 'Fat Loss',
  phone: '',
  quantity: '8',
  expiresAt: '',
  unlimited: false,
};

export default function MemberFormModal({
  open,
  onClose,
  member,
  onSubmit,
}) {
  const isEdit = Boolean(member);
  const [values, setValues] = useState(() =>
    isEdit
      ? {
          name: member.name,
          goal: member.goal || '',
          phone: member.phone || '',
          notes: member.notes || '',
          height: member.height ? String(member.height) : '',
          birthDate: member.birthDate || '',
        }
      : initialCreate
  );
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const schema = isEdit ? editSchema : createSchema;
    const result = schema.safeParse(values);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit member' : 'Tambah member baru'}
      description={
        isEdit
          ? 'Perbarui informasi profil member.'
          : 'Member akan ditambahkan ke workspace ini beserta kuota awalnya.'
      }
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="primary-button" form="member-form">
            {isEdit ? 'Simpan perubahan' : 'Tambah member'}
          </button>
        </>
      }
    >
      <form id="member-form" className="form-grid" onSubmit={handleSubmit}>
        <Field label="Nama lengkap" error={errors.name?.[0]} required>
          <input
            value={values.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder="Mis. Andi Pratama"
          />
        </Field>

        {!isEdit && (
          <Field label="Email" error={errors.email?.[0]} required>
            <input
              type="email"
              value={values.email}
              onChange={(event) => set('email', event.target.value)}
              placeholder="andi@fitflow.test"
            />
          </Field>
        )}

        <Field label="Tujuan latihan" error={errors.goal?.[0]}>
          <select value={values.goal} onChange={(event) => set('goal', event.target.value)}>
            <option value="">Pilih tujuan</option>
            {goals.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </Field>

        <Field label="No. telepon" error={errors.phone?.[0]}>
          <input
            value={values.phone}
            onChange={(event) => set('phone', event.target.value)}
            placeholder="0812-3456-7890"
          />
        </Field>

        {isEdit ? (
          <>
            <Field label="Tinggi badan (cm)" error={errors.height?.[0]}>
              <input
                type="number"
                value={values.height}
                onChange={(event) => set('height', event.target.value)}
                placeholder="172"
              />
            </Field>

            <Field label="Tanggal lahir" error={errors.birthDate?.[0]}>
              <input
                type="date"
                value={values.birthDate}
                onChange={(event) => set('birthDate', event.target.value)}
              />
            </Field>

            <div className="field-full">
              <Field label="Catatan" error={errors.notes?.[0]}>
                <textarea
                  rows={3}
                  value={values.notes}
                  onChange={(event) => set('notes', event.target.value)}
                  placeholder="Catatan khusus untuk member..."
                />
              </Field>
            </div>
          </>
        ) : (
          <>
            <Field label="Jumlah sesi" error={errors.quantity?.[0]}>
              <input
                type="number"
                min="1"
                value={values.quantity}
                onChange={(event) => set('quantity', event.target.value)}
                disabled={values.unlimited}
              />
            </Field>

            <Field label="Berlaku sampai" error={errors.expiresAt?.[0]}>
              <input
                type="date"
                value={values.expiresAt}
                onChange={(event) => set('expiresAt', event.target.value)}
              />
            </Field>

            <div className="field-full">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={values.unlimited}
                  onChange={(event) => set('unlimited', event.target.checked)}
                />
                <span>Kuota unlimited (audit tetap dicatat)</span>
              </label>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
