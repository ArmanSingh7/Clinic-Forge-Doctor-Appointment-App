import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../services/api';
import toast from 'react-hot-toast';

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'Australia' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+86', country: 'China' },
  { code: '+82', country: 'South Korea' },
  { code: '+55', country: 'Brazil' },
  { code: '+7', country: 'Russia' },
  { code: '+27', country: 'South Africa' },
  { code: '+234', country: 'Nigeria' },
];

export default function Login() {
  const [loginMode, setLoginMode] = useState('username'); // 'username' or 'mobile'
  const [form, setForm] = useState({ identifier: '', password: '', countryCode: '+91', mobileNo: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (loginMode === 'username') {
      if (!form.identifier.trim()) e.identifier = 'Username is required';
    } else {
      if (!form.mobileNo.trim()) e.mobileNo = 'Mobile number is required';
      else if (!/^\d{7,15}$/.test(form.mobileNo)) e.mobileNo = 'Enter a valid mobile number';
    }
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 4 || form.password.length > 18) e.password = 'Password must be 4-18 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const identifier = loginMode === 'username' ? form.identifier : form.countryCode + form.mobileNo;
      const res = await login({ identifier, password: form.password });
      const data = res.data.data;
      loginUser(data);
      toast.success('Login successful!');
      const role = data.role?.toLowerCase();
      navigate(`/${role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="text-center mb-4">
              <i className="bi bi-hospital fs-1 text-info"></i>
              <h2 className="fw-bold mt-2">Clinic Forge</h2>
              <p className="text-muted">Sign in to your account</p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                {/* Login Mode Toggle */}
                <div className="btn-group w-100 mb-3" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${loginMode === 'username' ? 'btn-info text-white' : 'btn-outline-info'}`}
                    onClick={() => setLoginMode('username')}
                  >
                    <i className="bi bi-person me-1"></i>Username
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${loginMode === 'mobile' ? 'btn-info text-white' : 'btn-outline-info'}`}
                    onClick={() => setLoginMode('mobile')}
                  >
                    <i className="bi bi-phone me-1"></i>Mobile
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {loginMode === 'username' ? (
                    <div className="mb-3">
                      <label className="form-label fw-medium">Username</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
                          placeholder="Enter username"
                          value={form.identifier}
                          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                        />
                        {errors.identifier && <div className="invalid-feedback">{errors.identifier}</div>}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label fw-medium">Mobile Number</label>
                      <div className="input-group">
                        <select
                          className="form-select"
                          style={{ maxWidth: '120px' }}
                          value={form.countryCode}
                          onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                        >
                          {countryCodes.map(c => (
                            <option key={c.code} value={c.code}>{c.code} {c.country}</option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          className={`form-control ${errors.mobileNo ? 'is-invalid' : ''}`}
                          placeholder="Enter mobile number"
                          value={form.mobileNo}
                          onChange={(e) => setForm({ ...form, mobileNo: e.target.value.replace(/\D/g, '') })}
                        />
                        {errors.mobileNo && <div className="invalid-feedback">{errors.mobileNo}</div>}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="form-label fw-medium">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-info text-white w-100 fw-semibold py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" />
                    ) : (
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                    )}
                    Sign In
                  </button>

                  <div className="text-end mt-2">
                    <Link to="/forgot-password" className="text-muted text-decoration-none small">
                      <i className="bi bi-question-circle me-1"></i>Forgot Password?
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="text-info fw-medium text-decoration-none">
                Register here
              </Link>
            </div>

            <div className="text-center mt-2">
              <Link to="/" className="text-muted text-decoration-none">
                <i className="bi bi-arrow-left me-1"></i>Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
