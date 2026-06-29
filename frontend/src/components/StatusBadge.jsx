const colors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
const labels = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };
export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
