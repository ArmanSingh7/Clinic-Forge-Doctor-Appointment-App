import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <i className="bi bi-shield-exclamation display-1 text-danger"></i>
        <h2 className="fw-bold mt-3">Access Denied</h2>
        <p className="text-muted">You don't have permission to access this page.</p>
        <Link to="/" className="btn btn-info text-white">
          <i className="bi bi-house me-2"></i>Go Home
        </Link>
      </div>
    </div>
  );
}
