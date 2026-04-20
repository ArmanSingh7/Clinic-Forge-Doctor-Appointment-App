import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
