import { useState } from 'react';
import { z } from 'zod';

import Field from '../ui/Field';
import Modal from '../ui/Modal';

const adjustSchema = z.object({
  mode: z.literal('adjust'),
  delta: z.coerce
    .number({ message: 'Harus angka.' })
    .int('Harus bilangan bulat.')
    .refine((value) => value !== 0, 'Perubahan tidak boleh nol.'),
  description: z.string().trim().min(3, 'Deskripsi minimal 3 karakter.'),
});

const createSchema = z.object({
  mode: z.literal('create'),
  quantity: z.coerce
    .number({ message: 'Harus angka.' })
    .int('Harus bilangan bulat.')
    .min(1, 'Minimal 1 sesi.'),
  expiresAt: z.string(),
  unlimited: z.boolean(),
});

export default function QuotaAdjustModal({ open, onClose, member, onSubmit }) {
  const [mode, setMode] = useState('adjust');
  const [values, setValues] = useState({
    delta: '1',
    description: 'Bonus session',
    quantity: '8',
    expiresAt: '',
    unlimited: false,
  });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const schema = mode === 'adjust' ? adjustSchema : createSchema;
    const result = schema.safeParse({ ...values, mode });

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
      title="Kelola kuota"
      description={member ? `Member: ${member.name}` : ''}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="primary-button" form="quota-form">
            Simpan
          </button>
        </>
      }
    >
      <div className="segmented-control">
        <button
          type="button"
          className={mode === 'adjust' ? 'is-active' : ''}
          onClick={() => setMode('adjust')}
        >
          Adjust kuota
        </button>
        <button
          type="button"
          className={mode === 'create' ? 'is-active' : ''}
          onClick={() => setMode('create')}
        >
          Paket baru
        </button>
      </div>

      <form id="quota-form" className="form-grid" onSubmit={handleSubmit}>
        {mode === 'adjust' ? (
          <>
            <Field
              label="Perubahan (±)"
              error={errors.delta?.[0]}
              hint="Gunakan angka negatif untuk mengurangi kuota."
              required
            >
              <input
                type="number"
                value={values.delta}
                onChange={(event) => set('delta', event.target.value)}
              />
            </Field>
            <div className="field-full">
              <Field label="Deskripsi" error={errors.description?.[0]} required>
                <input
                  value={values.description}
                  onChange={(event) => set('description', event.target.value)}
                  placeholder="Mis. Bonus sesi"
                />
              </Field>
            </div>
          </>
        ) : (
          <>
            <Field label="Jumlah sesi" error={errors.quantity?.[0]} required>
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
                <span>Kuota unlimited</span>
              </label>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
