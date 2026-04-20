export function StatusBadge({ status }) {
  const map = {
    PENDING: 'warning',
    APPROVED: 'info',
    CONFIRMED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'secondary',
  };
  const variant = map[status] || 'light';
  return <span className={`badge bg-${variant}`}>{status}</span>;
}
