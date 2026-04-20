import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card border-0 shadow-lg" style={{ maxWidth: 440, width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
              <i className="bi bi-shield-lock fs-2 text-info"></i>
            </div>
            <h4 className="fw-bold">Forgot Password?</h4>
            <p className="text-muted">Enter your email to receive a password reset link</p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 64, height: 64 }}>
                <i className="bi bi-envelope-check fs-2 text-success"></i>
              </div>
              <h5 className="fw-bold text-success">Email Sent!</h5>
              <p className="text-muted">Check your inbox for the password reset link. The link will expire in 1 hour.</p>
              <button className="btn btn-outline-info mt-2" onClick={() => { setSent(false); setEmail(''); }}>
                Send Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-medium">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><i className="bi bi-envelope text-muted"></i></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-info text-white w-100 py-2 fw-medium" disabled={loading}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                ) : (
                  <><i className="bi bi-send me-2"></i>Send Reset Link</>
                )}
              </button>
            </form>
          )}

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
