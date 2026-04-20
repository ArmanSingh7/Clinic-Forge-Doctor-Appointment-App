import { Link } from 'react-router-dom';
import ClinicForgeLogo from '../../components/ClinicForgeLogo';

export default function About() {
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
                  <Link to={item.to} className="nav-link px-3 fw-500" style={{ color: item.to === '/about' ? '#1B6EB5' : '#1a1a2e', fontSize: 15 }}>{item.label}</Link>
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
          <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 12, fontWeight: 600 }}>ABOUT US</span>
          <h1 className="fw-bold mb-3" style={{ color: '#1a1a2e', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>About Clinic Forge</h1>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: 600 }}>
            We are on a mission to make quality healthcare accessible, transparent, and effortless for everyone.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-3" style={{ color: '#1a1a2e' }}>Our Mission</h2>
              <p className="text-muted" style={{ lineHeight: 1.8, fontSize: 15 }}>
                Clinic Forge was created to bridge the gap between patients and healthcare providers. We believe that finding
                the right doctor, booking an appointment, and managing your health records should be simple, secure, and stress-free.
              </p>
              <p className="text-muted" style={{ lineHeight: 1.8, fontSize: 15 }}>
                Our platform connects patients with a network of verified, qualified doctors across 16+ specializations —
                empowering everyone to take control of their healthcare journey.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                {[
                  { icon: 'bi-heart-pulse-fill', value: '16+', label: 'Specializations', color: '#1B6EB5', bg: '#e8f0fe' },
                  { icon: 'bi-people-fill', value: '24/7', label: 'Platform Access', color: '#3DB39E', bg: '#e6f7f5' },
                  { icon: 'bi-shield-check', value: '100%', label: 'Secure & Private', color: '#E8A838', bg: '#fef6e6' },
                  { icon: 'bi-emoji-smile-fill', value: '0', label: 'Cost to Join', color: '#9B59B6', bg: '#f3ecfb' },
                ].map(stat => (
                  <div key={stat.label} className="col-6">
                    <div className="card border-0 p-3 text-center h-100" style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 52, height: 52, background: stat.bg }}>
                        <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: 22 }}></i>
                      </div>
                      <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>{stat.value}</h4>
                      <small style={{ color: '#6b7c93' }}>{stat.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-5" style={{ background: '#f8faff' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>Our Core Values</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 500 }}>The principles that guide everything we do</p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'bi-person-heart', title: 'Patient First', desc: 'Every feature we build starts with a simple question: does this make the patient\'s life easier?', color: '#1B6EB5' },
              { icon: 'bi-transparency', title: 'Transparency', desc: 'Open reviews, clear pricing, and no hidden fees. We believe trust is built through transparency.', color: '#3DB39E' },
              { icon: 'bi-lock-fill', title: 'Security & Privacy', desc: 'Your health data is protected with industry-standard encryption and secure authentication.', color: '#E8A838' },
              { icon: 'bi-lightning-charge-fill', title: 'Simplicity', desc: 'Healthcare is complex enough. Our platform is designed to be intuitive and effortless to use.', color: '#9B59B6' },
              { icon: 'bi-globe2', title: 'Accessibility', desc: 'Quality healthcare guidance should be available to everyone, regardless of location or background.', color: '#E84545' },
              { icon: 'bi-graph-up-arrow', title: 'Continuous Improvement', desc: 'We constantly evolve our platform based on feedback from patients and doctors.', color: '#1B6EB5' },
            ].map(val => (
              <div key={val.title} className="col-md-6 col-lg-4">
                <div className="card border-0 h-100 p-4" style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <i className={`bi ${val.icon} mb-3`} style={{ color: val.color, fontSize: 32 }}></i>
                  <h6 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>{val.title}</h6>
                  <p className="text-muted mb-0" style={{ fontSize: 14, lineHeight: 1.7 }}>{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Platform */}
      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #d6eaff 100%)' }}>
                <div className="text-center py-5">
                  <i className="bi bi-hospital-fill" style={{ fontSize: 80, color: '#1B6EB5' }}></i>
                  <h4 className="fw-bold mt-3" style={{ color: '#1a1a2e' }}>Clinic Forge</h4>
                  <p className="text-muted">Modern Healthcare Management Platform</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <h3 className="fw-bold mb-3" style={{ color: '#1a1a2e' }}>Built for Patients & Doctors</h3>
              <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>
                Clinic Forge provides a comprehensive healthcare management platform designed to serve three key user roles:
              </p>
              {[
                { role: 'Patients', desc: 'Search doctors, book appointments, view prescriptions, upload documents, and leave feedback.', icon: 'bi-person-fill', color: '#1B6EB5' },
                { role: 'Doctors', desc: 'Manage availability, handle appointments, prescribe medicines, and view patient records.', icon: 'bi-heart-pulse', color: '#3DB39E' },
                { role: 'Administrators', desc: 'Oversee the entire platform — manage users, appointments, and system operations.', icon: 'bi-gear-fill', color: '#E8A838' },
              ].map(r => (
                <div key={r.role} className="d-flex gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: `${r.color}18` }}>
                    <i className={`bi ${r.icon}`} style={{ color: r.color, fontSize: 18 }}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: '#1a1a2e', fontSize: 15 }}>{r.role}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: 14, lineHeight: 1.6 }}>{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1B6EB5 0%, #155d9e 100%)' }}>
        <div className="container text-center py-3">
          <h3 className="fw-bold text-white mb-2">Join Clinic Forge Today</h3>
          <p className="text-white-50 mb-4">Start managing your healthcare the modern way</p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link to="/register" className="btn btn-lg px-5 py-2 fw-semibold" style={{ background: '#fff', color: '#1B6EB5', borderRadius: 12, border: 'none' }}>
              <i className="bi bi-person-plus-fill me-2"></i>Create Free Account
            </Link>
            <Link to="/contact" className="btn btn-lg px-5 py-2 fw-semibold" style={{ background: 'transparent', color: '#fff', borderRadius: 12, border: '2px solid rgba(255,255,255,0.4)' }}>
              <i className="bi bi-envelope me-2"></i>Contact Us
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
