export default function StatCard({ icon, label, value, color = 'primary', subtitle }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center">
        <div
          className={`rounded-circle bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center me-3`}
          style={{ width: 56, height: 56, minWidth: 56 }}
        >
          <i className={`bi ${icon} fs-4 text-${color}`}></i>
        </div>
        <div>
          <h3 className="mb-0 fw-bold">{value}</h3>
          <small className="text-muted">{label}</small>
          {subtitle && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
