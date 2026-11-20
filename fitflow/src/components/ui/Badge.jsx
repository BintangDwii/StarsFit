const config = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  suspended: { label: 'Suspended', tone: 'danger' },
  confirmed: { label: 'Confirmed', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
  checked_in: { label: 'Checked in', tone: 'info' },
  completed: { label: 'Completed', tone: 'neutral' },
  no_show: { label: 'No show', tone: 'danger' },
  grant: { label: 'Grant', tone: 'success' },
  adjustment: { label: 'Adjustment', tone: 'info' },
  reservation: { label: 'Reservation', tone: 'warning' },
  release: { label: 'Release', tone: 'success' },
  consumed: { label: 'Consumed', tone: 'neutral' },
  expired: { label: 'Expired', tone: 'danger' },
  info: { label: 'Info', tone: 'info' },
};

export default function Badge({ status, children }) {
  const item = config[status] || { label: status, tone: 'neutral' };

  return (
    <span className={`badge badge--${item.tone}`}>
      {children || item.label}
    </span>
  );
}
