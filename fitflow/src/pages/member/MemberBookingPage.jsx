import { useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3 } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import Field from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import { toISO } from '../../lib/dates';
import { usePortal } from '../../hooks/usePortal';
import { useWorkspace } from '../../hooks/useWorkspace';

const TODAY_ISO = toISO(new Date());
const SLOTS = Array.from({ length: 10 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);

const addMinutes = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default function MemberBookingPage() {
  const { memberId } = usePortal();
  const { bookings, requestBooking, cancelBooking, rescheduleBooking } =
    useWorkspace();

  const [date, setDate] = useState(TODAY_ISO);
  const [slot, setSlot] = useState(null);
  const [duration, setDuration] = useState('60');
  const [note, setNote] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleValues, setRescheduleValues] = useState({
    date: TODAY_ISO,
    start: '09:00',
  });

  const myBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.memberId === memberId)
        .sort((a, b) => `${b.date}${b.start}`.localeCompare(`${a.date}${a.start}`)),
    [bookings, memberId]
  );

  const availableSlots = useMemo(() => {
    const busy = bookings.filter(
      (booking) =>
        booking.date === date &&
        ['pending', 'confirmed', 'checked_in'].includes(booking.status)
    );

    return SLOTS.filter((time) => {
      const end = addMinutes(time, Number(duration));
      return !busy.some(
        (booking) => time < booking.end && end > booking.start
      );
    });
  }, [bookings, date, duration]);

  const handleRequest = async () => {
    if (!slot || !agreed) return;

    await requestBooking({
      memberId,
      date,
      start: slot,
      end: addMinutes(slot, Number(duration)),
      note,
    });

    setSlot(null);
    setNote('');
    setAgreed(false);
  };

  return (
    <div className="portal-page">
      <div className="portal-greeting">
        <span>BOOKING</span>
        <h1>Book a Session</h1>
        <p>Pilih tanggal dan jam yang tersedia.</p>
      </div>

      <section className="portal-section">
        <label className="portal-field-label">Tanggal</label>
        <input
          type="date"
          className="portal-input"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setSlot(null);
          }}
        />
      </section>

      <section className="portal-section">
        <label className="portal-field-label">Durasi</label>
        <select
          className="portal-input"
          value={duration}
          onChange={(event) => {
            setDuration(event.target.value);
            setSlot(null);
          }}
        >
          <option value="30">30 menit</option>
          <option value="60">60 menit</option>
          <option value="90">90 menit</option>
        </select>
      </section>

      <section className="portal-section">
        <label className="portal-field-label">Slot tersedia</label>
        {availableSlots.length === 0 ? (
          <div className="portal-card">
            <p className="muted-copy">Tidak ada slot tersedia pada tanggal ini.</p>
          </div>
        ) : (
          <div className="slot-grid">
            {availableSlots.map((time) => (
              <button
                key={time}
                className={`slot-button ${slot === time ? 'slot-button--active' : ''}`}
                onClick={() => setSlot(time)}
              >
                <Clock3 size={13} />
                {time}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="portal-section">
        <label className="portal-field-label">Catatan (opsional)</label>
        <textarea
          className="portal-input"
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Mis. fokus pada upper body"
        />
      </section>

      <label className="portal-checkbox">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        <span>Saya menyetujui kebijakan pembatalan (minimal 12 jam sebelum sesi).</span>
      </label>

      <button
        className="portal-primary-button"
        disabled={!slot || !agreed}
        onClick={handleRequest}
      >
        <Check size={17} /> Request Booking
      </button>

      <section className="portal-section">
        <h2>Booking saya</h2>
        {myBookings.length === 0 ? (
          <div className="portal-card"><p className="muted-copy">Belum ada booking.</p></div>
        ) : (
          myBookings.map((booking) => (
            <div className="portal-card portal-booking-row" key={booking.id}>
              <div className="portal-card-row">
                <div className="portal-icon"><CalendarDays size={17} /></div>
                <div>
                  <strong>{booking.date}</strong>
                  <span>{booking.start} - {booking.end}</span>
                </div>
                <Badge status={booking.status} />
              </div>
              {['pending', 'confirmed'].includes(booking.status) && (
                <div className="portal-booking-actions">
                  <button
                    className="portal-link-button"
                    onClick={() => {
                      setRescheduleTarget(booking);
                      setRescheduleValues({
                        date: booking.date,
                        start: booking.start,
                      });
                    }}
                  >
                    Reschedule
                  </button>
                  <button
                    className="portal-link-button"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Batalkan booking
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <Modal
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule sesi"
        description="Pilih tanggal dan jam baru untuk booking ini."
        footer={
          <>
            <button
              className="secondary-button"
              onClick={() => setRescheduleTarget(null)}
            >
              Batal
            </button>
            <button
              className="primary-button"
              type="submit"
              form="reschedule-form"
            >
              Simpan jadwal
            </button>
          </>
        }
      >
        <form
          id="reschedule-form"
          className="form-grid"
          onSubmit={async (event) => {
            event.preventDefault();
            const [startHour, startMinute] = rescheduleValues.start
              .split(':')
              .map(Number);
            const [oldStartHour, oldStartMinute] = rescheduleTarget.start
              .split(':')
              .map(Number);
            const [oldEndHour, oldEndMinute] = rescheduleTarget.end
              .split(':')
              .map(Number);
            const length =
              oldEndHour * 60 + oldEndMinute - (oldStartHour * 60 + oldStartMinute);
            const total = startHour * 60 + startMinute + length;
            const end = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

            await rescheduleBooking(
              rescheduleTarget.id,
              rescheduleValues.date,
              rescheduleValues.start,
              end
            );
            setRescheduleTarget(null);
          }}
        >
          <Field label="Tanggal baru" required>
            <input
              type="date"
              value={rescheduleValues.date}
              onChange={(event) =>
                setRescheduleValues((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Jam baru" required>
            <input
              type="time"
              value={rescheduleValues.start}
              onChange={(event) =>
                setRescheduleValues((current) => ({
                  ...current,
                  start: event.target.value,
                }))
              }
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
