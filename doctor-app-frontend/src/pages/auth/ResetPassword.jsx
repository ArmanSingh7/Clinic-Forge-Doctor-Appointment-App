import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/.test(form.newPassword);
  const passwordsMatch = form.newPassword === form.confirmPassword && form.confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    if (!passwordValid) {
      toast.error('Password must be 8-20 characters with uppercase, lowercase, digit & special character (@$!%*?&#)');
      return;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card border-0 shadow-lg" style={{ maxWidth: 440, width: '100%' }}>
          <div className="card-body p-5 text-center">
            <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
              <i className="bi bi-exclamation-triangle fs-2 text-danger"></i>
            </div>
            <h5 className="fw-bold">Invalid Reset Link</h5>
            <p className="text-muted">This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="btn btn-info text-white">Request New Link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card border-0 shadow-lg" style={{ maxWidth: 440, width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
              <i className="bi bi-key fs-2 text-info"></i>
            </div>
            <h4 className="fw-bold">Reset Password</h4>
            <p className="text-muted">Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-medium">New Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-lock text-muted"></i></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-control ${form.newPassword ? (passwordValid ? 'is-valid' : 'is-invalid') : ''}`}
                  placeholder="4-18 characters"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPw(!showPw)}>
                  <i className={`bi ${showPw ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-medium">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-lock-fill text-muted"></i></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-control ${form.confirmPassword ? (passwordsMatch ? 'is-valid' : 'is-invalid') : ''}`}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
              </div>
              {form.confirmPassword && !passwordsMatch && (
                <div className="text-danger small mt-1"><i className="bi bi-x-circle me-1"></i>Passwords do not match</div>
              )}
              {passwordsMatch && (
                <div className="text-success small mt-1"><i className="bi bi-check-circle me-1"></i>Passwords match</div>
              )}
            </div>

            <button type="submit" className="btn btn-info text-white w-100 py-2 fw-medium" disabled={loading || !passwordValid || !passwordsMatch}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</>
              ) : (
                <><i className="bi bi-check-lg me-2"></i>Reset Password</>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/login" className="text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i>Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
