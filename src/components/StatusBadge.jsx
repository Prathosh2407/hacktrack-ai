const STATUS_COLORS = {
  planning: 'badge-neutral',
  registered: 'badge-info',
  submitted: 'badge-warning',
  completed: 'badge-success',
  rejected: 'badge-danger',
  applied: 'badge-info',
  interview: 'badge-warning',
  offer: 'badge-success',
  withdrawn: 'badge-neutral',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status?.toLowerCase()] || 'badge-neutral';
  return <span className={`badge ${cls}`}>{status}</span>;
}
