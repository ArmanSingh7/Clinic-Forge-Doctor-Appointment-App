import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-info">404</h1>
        <h4 className="fw-bold">Page Not Found</h4>
        <p className="text-muted">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-info text-white">
          <i className="bi bi-house me-2"></i>Go Home
        </Link>
      </div>
    </div>
  );
}
