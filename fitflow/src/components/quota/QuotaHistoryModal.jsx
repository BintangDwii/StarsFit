import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function QuotaHistoryModal({ open, onClose, member }) {
  const history = member?.quota?.history || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Riwayat kuota"
      description={member ? `${member.name} · ${member.quota?.unlimited ? 'Unlimited' : `${member.quota?.available ?? 0} sesi tersedia`}` : ''}
      size="lg"
      footer={
        <button className="secondary-button" onClick={onClose}>
          Tutup
        </button>
      }
    >
      {history.length === 0 ? (
        <p className="muted-copy">Belum ada riwayat kuota.</p>
      ) : (
        <div className="timeline">
          {history.map((entry) => (
            <div className="timeline-item" key={entry.id}>
              <Badge status={entry.type} />
              <div>
                <strong>{entry.description}</strong>
                <span>{formatDate(entry.date)}</span>
              </div>
              {entry.quantity !== 0 && (
                <span className={entry.quantity > 0 ? 'positive' : 'negative'}>
                  {entry.quantity > 0 ? '+' : ''}{entry.quantity}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
