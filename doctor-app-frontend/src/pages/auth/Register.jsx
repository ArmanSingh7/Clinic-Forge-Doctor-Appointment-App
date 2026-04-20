import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerPatient, registerDoctor } from '../../services/api';
import CitySelect from '../../components/CitySelect';
import SpecializationSelect from '../../components/SpecializationSelect';
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

export default function Register() {
  const [role, setRole] = useState('PATIENT');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [patientForm, setPatientForm] = useState({
    userName: '', password: '', confirmPassword: '', patientName: '',
    countryCode: '+91', mobileNo: '', email: '', bloodGroup: '', gender: '', age: '', address: '', city: '',
  });

  const [doctorForm, setDoctorForm] = useState({
    userName: '', password: '', confirmPassword: '', doctorName: '', speciality: '',
    location: '', hospitalName: '', countryCode: '+91', mobileNo: '', email: '', chargedPerVisit: '', city: '',
  });

  const handlePatientChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };
  const handleDoctorChange = (e) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const form = role === 'PATIENT' ? patientForm : doctorForm;
    const e = {};

    if (!form.userName.trim()) e.userName = 'Username is required';
    else if (!/^[a-zA-Z0-9]+$/.test(form.userName)) e.userName = 'Username must contain only letters and numbers';

    const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,20}$/;
    if (!form.password) e.password = 'Password is required';
    else if (!strongPw.test(form.password)) e.password = 'Must be 8-20 characters with at least one uppercase, lowercase, digit & special character (@$!%*?&#)';

    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (role === 'PATIENT') {
      if (!form.patientName.trim()) e.patientName = 'Full name is required';
      if (!form.age || parseInt(form.age) < 1) e.age = 'Valid age is required';
    } else {
      if (!form.doctorName.trim()) e.doctorName = 'Full name is required';
      if (!form.speciality.trim()) e.speciality = 'Speciality is required';
      if (!form.chargedPerVisit || parseFloat(form.chargedPerVisit) < 1) e.chargedPerVisit = 'Valid charge is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (role === 'PATIENT') {
        const { countryCode, mobileNo, ...rest } = patientForm;
        await registerPatient({
          ...rest,
          mobileNo: mobileNo ? countryCode + mobileNo : '',
          age: parseInt(patientForm.age),
        });
      } else if (role === 'DOCTOR') {
        const { countryCode, mobileNo, ...rest } = doctorForm;
        await registerDoctor({
          ...rest,
          mobileNo: mobileNo ? countryCode + mobileNo : '',
          chargedPerVisit: parseFloat(doctorForm.chargedPerVisit),
        });
      }
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (field) => errors[field] ? <div className="text-danger small mt-1">{errors[field]}</div> : null;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="text-center mb-4">
              <i className="bi bi-hospital fs-1 text-info"></i>
              <h2 className="fw-bold mt-2">Join Clinic Forge</h2>
              <p className="text-muted">Create your account</p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="btn-group w-100 mb-4" role="group">
                  <button
                    className={`btn ${role === 'PATIENT' ? 'btn-info text-white' : 'btn-outline-info'}`}
                    onClick={() => { setRole('PATIENT'); setErrors({}); }}
                    type="button"
                  >
                    <i className="bi bi-person me-2"></i>Patient
                  </button>
                  <button
                    className={`btn ${role === 'DOCTOR' ? 'btn-info text-white' : 'btn-outline-info'}`}
                    onClick={() => { setRole('DOCTOR'); setErrors({}); }}
                    type="button"
                  >
                    <i className="bi bi-heart-pulse me-2"></i>Doctor
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {role === 'PATIENT' ? (
                    <>
                      <div className="row g-3">
                        {/* Personal Information */}
                        <div className="col-12">
                          <h6 className="fw-semibold text-muted mb-0"><i className="bi bi-person-vcard me-2"></i>Personal Information</h6>
                          <hr className="mt-2 mb-0" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Full Name *</label>
                          <input className={`form-control ${errors.patientName ? 'is-invalid' : ''}`} name="patientName" value={patientForm.patientName} onChange={handlePatientChange} />
                          {renderFieldError('patientName')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Email *</label>
                          <input className="form-control" type="email" name="email" value={patientForm.email} onChange={handlePatientChange} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Mobile</label>
                          <div className="input-group">
                            <select className="form-select" style={{ maxWidth: '110px' }} name="countryCode" value={patientForm.countryCode} onChange={handlePatientChange}>
                              {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} {c.country}</option>)}
                            </select>
                            <input className="form-control" name="mobileNo" value={patientForm.mobileNo} onChange={(e) => setPatientForm({ ...patientForm, mobileNo: e.target.value.replace(/\D/g, '') })} placeholder="Phone number" />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Age *</label>
                          <input className={`form-control ${errors.age ? 'is-invalid' : ''}`} type="number" name="age" value={patientForm.age} onChange={handlePatientChange} min="1" />
                          {renderFieldError('age')}
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Gender</label>
                          <select className="form-select" name="gender" value={patientForm.gender} onChange={handlePatientChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Blood Group</label>
                          <select className="form-select" name="bloodGroup" value={patientForm.bloodGroup} onChange={handlePatientChange}>
                            <option value="">Select</option>
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">City</label>
                          <CitySelect value={patientForm.city} onChange={handlePatientChange} />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Address</label>
                          <textarea className="form-control" name="address" value={patientForm.address} onChange={handlePatientChange} rows="2" />
                        </div>

                        {/* Account Credentials */}
                        <div className="col-12 mt-3">
                          <h6 className="fw-semibold text-muted mb-0"><i className="bi bi-shield-lock me-2"></i>Account Credentials</h6>
                          <hr className="mt-2 mb-0" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Username *</label>
                          <input className={`form-control ${errors.userName ? 'is-invalid' : ''}`} name="userName" value={patientForm.userName} onChange={handlePatientChange} placeholder="Letters and numbers only" />
                          {renderFieldError('userName')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Password *</label>
                          <input className={`form-control ${errors.password ? 'is-invalid' : ''}`} type="password" name="password" value={patientForm.password} onChange={handlePatientChange} placeholder="e.g. Pass@1234" />
                          {renderFieldError('password')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Confirm Password *</label>
                          <input className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} type="password" name="confirmPassword" value={patientForm.confirmPassword} onChange={handlePatientChange} />
                          {renderFieldError('confirmPassword')}
                          {patientForm.password && patientForm.confirmPassword && patientForm.password === patientForm.confirmPassword && (
                            <div className="text-success small mt-1"><i className="bi bi-check-circle me-1"></i>Passwords match</div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="row g-3">
                        {/* Personal & Professional Information */}
                        <div className="col-12">
                          <h6 className="fw-semibold text-muted mb-0"><i className="bi bi-person-vcard me-2"></i>Personal & Professional Information</h6>
                          <hr className="mt-2 mb-0" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Full Name *</label>
                          <input className={`form-control ${errors.doctorName ? 'is-invalid' : ''}`} name="doctorName" value={doctorForm.doctorName} onChange={handleDoctorChange} />
                          {renderFieldError('doctorName')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Email *</label>
                          <input className="form-control" type="email" name="email" value={doctorForm.email} onChange={handleDoctorChange} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Speciality *</label>
                          <SpecializationSelect className={`form-select ${errors.speciality ? 'is-invalid' : ''}`} name="speciality" value={doctorForm.speciality} onChange={handleDoctorChange} />
                          {renderFieldError('speciality')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Hospital Name</label>
                          <input className="form-control" name="hospitalName" value={doctorForm.hospitalName} onChange={handleDoctorChange} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Mobile</label>
                          <div className="input-group">
                            <select className="form-select" style={{ maxWidth: '110px' }} name="countryCode" value={doctorForm.countryCode} onChange={handleDoctorChange}>
                              {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} {c.country}</option>)}
                            </select>
                            <input className="form-control" name="mobileNo" value={doctorForm.mobileNo} onChange={(e) => setDoctorForm({ ...doctorForm, mobileNo: e.target.value.replace(/\D/g, '') })} placeholder="Phone number" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Charge Per Visit (₹) *</label>
                          <input className={`form-control ${errors.chargedPerVisit ? 'is-invalid' : ''}`} type="number" name="chargedPerVisit" value={doctorForm.chargedPerVisit} onChange={handleDoctorChange} min="1" />
                          {renderFieldError('chargedPerVisit')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Address</label>
                          <input className="form-control" name="location" value={doctorForm.location} onChange={handleDoctorChange} placeholder="Enter address" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">City</label>
                          <CitySelect value={doctorForm.city} onChange={handleDoctorChange} />
                        </div>

                        {/* Account Credentials */}
                        <div className="col-12 mt-3">
                          <h6 className="fw-semibold text-muted mb-0"><i className="bi bi-shield-lock me-2"></i>Account Credentials</h6>
                          <hr className="mt-2 mb-0" />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Username *</label>
                          <input className={`form-control ${errors.userName ? 'is-invalid' : ''}`} name="userName" value={doctorForm.userName} onChange={handleDoctorChange} placeholder="Letters and numbers only" />
                          {renderFieldError('userName')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Password *</label>
                          <input className={`form-control ${errors.password ? 'is-invalid' : ''}`} type="password" name="password" value={doctorForm.password} onChange={handleDoctorChange} placeholder="e.g. Pass@1234" />
                          {renderFieldError('password')}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Confirm Password *</label>
                          <input className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} type="password" name="confirmPassword" value={doctorForm.confirmPassword} onChange={handleDoctorChange} />
                          {renderFieldError('confirmPassword')}
                          {doctorForm.password && doctorForm.confirmPassword && doctorForm.password === doctorForm.confirmPassword && (
                            <div className="text-success small mt-1"><i className="bi bi-check-circle me-1"></i>Passwords match</div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <button type="submit" className="btn btn-info text-white w-100 fw-semibold py-2 mt-4" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-person-plus me-2"></i>}
                    Create Account
                  </button>
                </form>
              </div>
            </div>

            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="text-info fw-medium text-decoration-none">Sign In</Link>
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
