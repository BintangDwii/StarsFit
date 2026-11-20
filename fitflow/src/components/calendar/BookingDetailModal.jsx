import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { formatLongDate } from '../../lib/dates';

export default function BookingDetailModal({
  open,
  onClose,
  booking,
  onApprove,
  onReject,
  onCancel,
  onCheckIn,
  onComplete,
  onNoShow,
}) {
  if (!booking) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail booking"
      description={booking.memberName}
      footer={
        <button className="secondary-button" onClick={onClose}>
          Tutup
        </button>
      }
    >
      <div className="booking-detail">
        <div className="booking-detail-status">
          <Badge status={booking.status} />
        </div>

        <div className="info-list">
          <div className="info-row">
            <div className="info-label"><span>Member</span></div>
            <strong>{booking.memberName}</strong>
          </div>
          <div className="info-row">
            <div className="info-label"><span>Tanggal</span></div>
            <strong>{formatLongDate(new Date(`${booking.date}T00:00:00`))}</strong>
          </div>
          <div className="info-row">
            <div className="info-label"><span>Jam</span></div>
            <strong>{booking.start} - {booking.end}</strong>
          </div>
          {booking.note && (
            <div className="info-row">
              <div className="info-label"><span>Catatan</span></div>
              <strong>{booking.note}</strong>
            </div>
          )}
        </div>

        <div className="booking-actions">
          {booking.status === 'pending' && (
            <>
              <button className="primary-button" onClick={() => onApprove(booking.id)}>
                Approve
              </button>
              <button className="danger-button" onClick={() => onReject(booking.id)}>
                Reject
              </button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <>
              <button className="primary-button" onClick={() => onCheckIn(booking.id)}>
                Check in
              </button>
              <button className="secondary-button" onClick={() => onComplete(booking.id)}>
                Complete
              </button>
            </>
          )}
          {booking.status === 'checked_in' && (
            <button className="primary-button" onClick={() => onComplete(booking.id)}>
              Complete session
            </button>
          )}
          {['confirmed', 'checked_in'].includes(booking.status) && (
            <button className="secondary-button danger-text" onClick={() => onNoShow(booking.id)}>
              No show
            </button>
          )}
          {['pending', 'confirmed'].includes(booking.status) && (
            <button className="secondary-button danger-text" onClick={() => onCancel(booking.id)}>
              Cancel booking
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
