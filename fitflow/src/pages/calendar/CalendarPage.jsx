import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import Badge from '../../components/ui/Badge';
import BookingDetailModal from '../../components/calendar/BookingDetailModal';
import BookingFormModal from '../../components/calendar/BookingFormModal';
import {
  addDays,
  addMonths,
  formatLongDate,
  formatShortDate,
  monthMatrix,
  monthName,
  sameDay,
  startOfWeek,
  toISO,
  weekdayNames,
} from '../../lib/dates';
import { useWorkspace } from '../../hooks/useWorkspace';

const TODAY = new Date();
const TODAY_ISO = toISO(TODAY);

const views = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

const hours = Array.from({ length: 14 }, (_, index) => index + 7);

function BookingChip({ booking, onClick }) {
  return (
    <button
      className={`calendar-booking calendar-booking--${booking.status}`}
      onClick={() => onClick(booking)}
      title={`${booking.memberName} · ${booking.start}`}
    >
      <span>{booking.start}</span>
      <strong>{booking.memberName}</strong>
    </button>
  );
}

export default function CalendarPage() {
  const {
    members,
    bookings,
    requestBooking,
    approveBooking,
    rejectBooking,
    cancelBooking,
    checkInBooking,
    completeBooking,
    markNoShow,
  } = useWorkspace();

  const [view, setView] = useState('week');
  const [cursor, setCursor] = useState(TODAY);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const pending = useMemo(
    () => bookings.filter((booking) => booking.status === 'pending'),
    [bookings]
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(cursor), index)),
    [cursor]
  );

  const monthDays = useMemo(() => monthMatrix(cursor), [cursor]);

  const bookingsOn = (date) =>
    bookings.filter((booking) => booking.date === toISO(date));

  const move = (direction) => {
    if (view === 'month') {
      setCursor((current) => addMonths(current, direction));
    } else if (view === 'week') {
      setCursor((current) => addDays(current, direction * 7));
    } else {
      setCursor((current) => addDays(current, direction));
    }
  };

  const label =
    view === 'month'
      ? monthName(cursor)
      : view === 'week'
        ? `${formatShortDate(weekDays[0])} - ${formatShortDate(weekDays[6])}`
        : formatLongDate(cursor);

  const handleFormSubmit = async (values) => {
    await requestBooking(values);
    setFormOpen(false);
  };

  const handleAction = (action) => async (id) => {
    await action(id);
    setSelected(null);
  };

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE</span>
          <h1>Calendar</h1>
          <p>Kelola jadwal latihan dan persetujuan booking.</p>
        </div>
        <button className="primary-button" onClick={() => setFormOpen(true)}>
          <Plus size={17} /> New booking
        </button>
      </div>

      <section className="card calendar-card">
        <div className="calendar-toolbar">
          <div className="segmented-control calendar-view-switch">
            {views.map((item) => (
              <button
                key={item.id}
                className={view === item.id ? 'is-active' : ''}
                onClick={() => setView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="calendar-navigation">
            <button className="icon-button" onClick={() => move(-1)} aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button className="secondary-button" onClick={() => setCursor(TODAY)}>
              Today
            </button>
            <button className="icon-button" onClick={() => move(1)} aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>

          <strong className="calendar-label">{label}</strong>
        </div>

        {view === 'month' && (
          <div className="calendar-month">
            {weekdayNames.map((name) => (
              <div className="calendar-weekday" key={name}>{name}</div>
            ))}
            {monthDays.map((day) => {
              const dayBookings = bookingsOn(day);
              const inMonth = day.getMonth() === cursor.getMonth();

              return (
                <div
                  key={toISO(day)}
                  className={`calendar-month-cell ${inMonth ? '' : 'is-outside'} ${sameDay(day, TODAY) ? 'is-today' : ''}`}
                  onClick={() => {
                    setCursor(day);
                    setView('day');
                  }}
                >
                  <span className="calendar-day-number">{day.getDate()}</span>
                  <div className="calendar-cell-bookings">
                    {dayBookings.slice(0, 2).map((booking) => (
                      <BookingChip key={booking.id} booking={booking} onClick={setSelected} />
                    ))}
                    {dayBookings.length > 2 && (
                      <span className="calendar-more">+{dayBookings.length - 2} lagi</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'week' && (
          <div className="calendar-week">
            {weekDays.map((day) => (
              <div className="calendar-week-column" key={toISO(day)}>
                <div
                  className={`calendar-week-header ${sameDay(day, TODAY) ? 'is-today' : ''}`}
                  onClick={() => {
                    setCursor(day);
                    setView('day');
                  }}
                >
                  <span>{weekdayNames[(day.getDay() + 6) % 7]}</span>
                  <strong>{day.getDate()}</strong>
                </div>
                <div className="calendar-week-body">
                  {bookingsOn(day).length === 0 ? (
                    <span className="calendar-empty">-</span>
                  ) : (
                    bookingsOn(day).map((booking) => (
                      <BookingChip key={booking.id} booking={booking} onClick={setSelected} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'day' && (
          <div className="calendar-day">
            {hours.map((hour) => {
              const dayBookings = bookingsOn(cursor).filter(
                (booking) => Number(booking.start.slice(0, 2)) === hour
              );

              return (
                <div className="calendar-hour-row" key={hour}>
                  <span className="calendar-hour-label">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                  <div className="calendar-hour-content">
                    {dayBookings.map((booking) => (
                      <BookingChip key={booking.id} booking={booking} onClick={setSelected} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="dashboard-grid">
        <section className="card">
          <div className="section-header">
            <h2>Pending Requests</h2>
            <Badge status="pending">{pending.length}</Badge>
          </div>

          {pending.length === 0 ? (
            <p className="muted-copy">Tidak ada booking yang menunggu persetujuan.</p>
          ) : (
            <div className="pending-request-list">
              {pending.map((booking) => (
                <div className="pending-request" key={booking.id}>
                  <div className="member-avatar">
                    {booking.memberName.split(' ').slice(0, 2).map((part) => part[0]).join('')}
                  </div>
                  <div className="pending-request-copy">
                    <strong>{booking.memberName}</strong>
                    <span>{formatShortDate(new Date(`${booking.date}T00:00:00`))} · {booking.start} - {booking.end}</span>
                  </div>
                  <div className="table-actions">
                    <button
                      className="action-button action-approve"
                      title="Approve"
                      aria-label={`Approve ${booking.memberName}`}
                      onClick={() => approveBooking(booking.id)}
                    >
                      ✓
                    </button>
                    <button
                      className="action-button action-reject"
                      title="Reject"
                      aria-label={`Reject ${booking.memberName}`}
                      onClick={() => rejectBooking(booking.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-header"><h2>Legend</h2></div>
          <div className="calendar-legend">
            <span><i className="legend-dot legend-dot--pending" /> Pending · menunggu approval</span>
            <span><i className="legend-dot legend-dot--confirmed" /> Confirmed · kuota ditahan</span>
            <span><i className="legend-dot legend-dot--checked_in" /> Checked in · sedang latihan</span>
            <span><i className="legend-dot legend-dot--completed" /> Completed · selesai</span>
            <span><i className="legend-dot legend-dot--cancelled" /> Cancelled / rejected / no-show</span>
          </div>
        </section>
      </div>

      <BookingDetailModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        booking={selected}
        onApprove={handleAction(approveBooking)}
        onReject={handleAction(rejectBooking)}
        onCancel={handleAction(cancelBooking)}
        onCheckIn={handleAction(checkInBooking)}
        onComplete={handleAction(completeBooking)}
        onNoShow={handleAction(markNoShow)}
      />

      <BookingFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        members={members}
        initialDate={TODAY_ISO}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
