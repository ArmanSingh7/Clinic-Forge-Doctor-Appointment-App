import { Link } from 'react-router-dom';
import ClinicForgeLogo from '../../components/ClinicForgeLogo';

const SERVICES = [
  {
    icon: 'bi-calendar2-plus-fill', title: 'Book an Appointment', color: '#1B6EB5', bg: '#e8f0fe',
    desc: 'Browse available doctors, pick a convenient time slot, and instantly confirm your appointment — no phone calls needed.',
    features: ['Real-time slot availability', 'Instant booking confirmation', 'Easy rescheduling & cancellation'],
  },
  {
    icon: 'bi-search-heart-fill', title: 'Find a Doctor', color: '#3DB39E', bg: '#e6f7f5',
    desc: 'Search doctors by specialization, city, or name. View their profiles, qualifications, and patient reviews before you decide.',
    features: ['16+ specializations', 'Location-based search', 'Patient ratings & reviews'],
  },
  {
    icon: 'bi-clock-history', title: 'Doctor Availability', color: '#E8A838', bg: '#fef6e6',
    desc: 'Doctors set their own weekly schedules. Always see real-time, up-to-date availability so you never miss an open slot.',
    features: ['Weekly schedule management', 'Auto time-slot generation', 'Calendar view for patients'],
  },
  {
    icon: 'bi-capsule-pill', title: 'Prescriptions & Medicines', color: '#9B59B6', bg: '#f3ecfb',
    desc: 'After every confirmed appointment, doctors issue digital prescriptions directly accessible in your patient dashboard.',
    features: ['Digital prescriptions', 'Dosage & frequency details', 'Full prescription history'],
  },
  {
    icon: 'bi-chat-square-dots-fill', title: 'Feedback & Reviews', color: '#E84545', bg: '#fdeaea',
    desc: 'Rate your experience and leave feedback for your doctor after each visit. Transparent reviews help others choose wisely.',
    features: ['Star ratings (1-5)', 'Written feedback', 'Public doctor reviews'],
  },
  {
    icon: 'bi-file-earmark-medical-fill', title: 'Document Management', color: '#1B6EB5', bg: '#e8f0fe',
    desc: 'Securely upload and store medical documents under your profile. Doctors can access them during your consultation.',
    features: ['Secure file upload', 'Multi-format support', 'Doctor-patient document sharing'],
  },
  {
    icon: 'bi-bell-fill', title: 'Real-Time Notifications', color: '#3DB39E', bg: '#e6f7f5',
    desc: 'Stay updated with instant in-app notifications for appointment status changes, approvals, and feedback.',
    features: ['Appointment status alerts', 'Feedback notifications', 'Unread count badge'],
  },
  {
    icon: 'bi-shield-lock-fill', title: 'Secure Authentication', color: '#E8A838', bg: '#fef6e6',
    desc: 'Industry-standard JWT-based authentication with role-based access control for patients, doctors, and admins.',
    features: ['JWT token security', 'Role-based access', 'Password reset via email'],
  },
  {
    icon: 'bi-speedometer2', title: 'Admin Dashboard', color: '#9B59B6', bg: '#f3ecfb',
    desc: 'Comprehensive admin panel to manage doctors, patients, appointments, and feedback — all from one centralized dashboard.',
    features: ['Manage all users', 'Appointment oversight', 'Feedback moderation'],
  },
];

export default function Services() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg fixed-top" style={{ background: '#fff', boxShadow: '0 2px 20px rgba(27,110,181,0.10)', zIndex: 1050 }}>
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold fs-4 text-decoration-none d-flex align-items-center gap-2" style={{ color: '#1B6EB5' }}>
            <ClinicForgeLogo size={38} />
            Clinic Forge
          </Link>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navPub">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navPub">
            <ul className="navbar-nav mx-auto gap-1">
              {[{ label: 'Home', to: '/' }, { label: 'Doctors', to: '/doctors' }, { label: 'Services', to: '/services' }, { label: 'About Us', to: '/about' }].map(item => (
                <li className="nav-item" key={item.label}>
                  <Link to={item.to} className="nav-link px-3 fw-500" style={{ color: item.to === '/services' ? '#1B6EB5' : '#1a1a2e', fontSize: 15 }}>{item.label}</Link>
                </li>
              ))}
            </ul>
            <div className="d-flex gap-2 mt-2 mt-lg-0">
              <Link to="/login" className="btn btn-outline-primary px-4 fw-semibold" style={{ borderColor: '#1B6EB5', color: '#1B6EB5', borderRadius: 8 }}>Sign In</Link>
              <Link to="/register" className="btn px-4 fw-semibold text-white" style={{ background: '#1B6EB5', borderRadius: 8, border: 'none' }}>Register</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 100, background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 100%)' }}>
        <div className="container py-5 text-center">
          <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 12, fontWeight: 600 }}>OUR SERVICES</span>
          <h1 className="fw-bold mb-3" style={{ color: '#1a1a2e', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>What We Offer</h1>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: 560 }}>
            Everything you need to manage your healthcare journey — from finding the right doctor to tracking your prescriptions.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="row g-4">
            {SERVICES.map((svc) => (
              <div key={svc.title} className="col-md-6 col-lg-4">
                <div className="card border-0 h-100 p-4" style={{ borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60, background: svc.bg }}>
                    <i className={`bi ${svc.icon}`} style={{ color: svc.color, fontSize: 24 }}></i>
                  </div>
                  <h5 className="fw-bold mb-2" style={{ color: '#1a1a2e', fontSize: 16 }}>{svc.title}</h5>
                  <p className="text-muted mb-3" style={{ fontSize: 14, lineHeight: 1.75 }}>{svc.desc}</p>
                  <ul className="list-unstyled mb-0 mt-auto">
                    {svc.features.map(f => (
                      <li key={f} className="d-flex align-items-center gap-2 mb-1">
                        <i className="bi bi-check-circle-fill" style={{ color: svc.color, fontSize: '0.75rem' }}></i>
                        <small style={{ color: '#6b7c93' }}>{f}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1B6EB5 0%, #155d9e 100%)' }}>
        <div className="container py-3">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white mb-2">How It Works</h2>
            <p className="text-white-50">Get started in three simple steps</p>
          </div>
          <div className="row g-4 text-center">
            {[
              { step: '01', icon: 'bi-person-plus-fill', title: 'Create Account', desc: 'Register as a patient in under a minute. Free and secure.' },
              { step: '02', icon: 'bi-search-heart', title: 'Find Doctor', desc: 'Browse specialists, read reviews, and choose the right doctor.' },
              { step: '03', icon: 'bi-calendar2-check-fill', title: 'Book & Confirm', desc: 'Pick an available slot and confirm your appointment instantly.' },
            ].map((item, i) => (
              <div key={i} className="col-md-4">
                <div className="card border-0 h-100 p-4" style={{ borderRadius: 18, background: 'rgba(255,255,255,0.10)' }}>
                  <div className="fw-bold mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 48, lineHeight: 1 }}>{item.step}</div>
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)' }}>
                    <i className={`bi ${item.icon}`} style={{ color: '#fff', fontSize: 26 }}></i>
                  </div>
                  <h5 className="fw-bold text-white mb-2">{item.title}</h5>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: '#f8faff' }}>
        <div className="container text-center py-3">
          <h3 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>Ready to experience better healthcare?</h3>
          <p className="text-muted mb-4">Join thousands of patients who trust Clinic Forge for their medical needs</p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="/register" className="btn btn-lg px-5 py-2 fw-semibold text-white" style={{ background: '#1B6EB5', borderRadius: 10, border: 'none' }}>
              <i className="bi bi-rocket-takeoff-fill me-2"></i>Get Started Free
            </Link>
            <Link to="/doctors" className="btn btn-lg px-5 py-2 fw-semibold" style={{ background: '#fff', color: '#1B6EB5', border: '2px solid #1B6EB5', borderRadius: 10 }}>
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0d1b2e', color: '#fff' }}>
        <div className="container py-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <ClinicForgeLogo size={32} />
              <span className="fw-bold" style={{ color: '#fff' }}>Clinic Forge</span>
            </div>
            <small style={{ color: 'rgba(255,255,255,0.4)' }}>&copy; {new Date().getFullYear()} Clinic Forge. All rights reserved.</small>
          </div>
        </div>
      </footer>
    </div>
  );
}
