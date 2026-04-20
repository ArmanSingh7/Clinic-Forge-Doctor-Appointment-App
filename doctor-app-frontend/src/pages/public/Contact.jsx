import { Link } from 'react-router-dom';
import { useState } from 'react';
import ClinicForgeLogo from '../../components/ClinicForgeLogo';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    // In a real app, this would send to a backend endpoint
    setSubmitted(true);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

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
                  <Link to={item.to} className="nav-link px-3 fw-500" style={{ color: '#1a1a2e', fontSize: 15 }}>{item.label}</Link>
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
          <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 12, fontWeight: 600 }}>CONTACT US</span>
          <h1 className="fw-bold mb-3" style={{ color: '#1a1a2e', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>Get In Touch</h1>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: 560 }}>
            Have a question or need help? We'd love to hear from you. Reach out and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="row g-5">
            {/* Contact Info */}
            <div className="col-lg-5">
              <h4 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>Contact Information</h4>
              {[
                { icon: 'bi-geo-alt-fill', title: 'Address', text: '123 Health Avenue, Medical District, Mumbai 400001', color: '#1B6EB5' },
                { icon: 'bi-telephone-fill', title: 'Phone', text: '+91 123 456 7890', color: '#3DB39E' },
                { icon: 'bi-envelope-fill', title: 'Email', text: 'support@clinicforge.com', color: '#E8A838' },
                { icon: 'bi-clock-fill', title: 'Working Hours', text: 'Mon - Sat: 9:00 AM - 8:00 PM\nSunday: 10:00 AM - 4:00 PM', color: '#9B59B6' },
              ].map(info => (
                <div key={info.title} className="d-flex gap-3 mb-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, background: `${info.color}15` }}>
                    <i className={`bi ${info.icon}`} style={{ color: info.color, fontSize: 20 }}></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: '#1a1a2e', fontSize: 15 }}>{info.title}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: 14, whiteSpace: 'pre-line' }}>{info.text}</p>
                  </div>
                </div>
              ))}

              {/* Social */}
              <div className="mt-4">
                <h6 className="fw-bold mb-3" style={{ color: '#1a1a2e', fontSize: 15 }}>Follow Us</h6>
                <div className="d-flex gap-3">
                  {['facebook', 'twitter-x', 'instagram', 'linkedin'].map(icon => (
                    <div key={icon} className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: '#e8f0fe', cursor: 'pointer' }}>
                      <i className={`bi bi-${icon}`} style={{ color: '#1B6EB5', fontSize: 16 }}></i>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="col-lg-7">
              <div className="card border-0 p-4 p-lg-5" style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                {submitted ? (
                  <div className="text-center py-5">
                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 80, height: 80, background: '#e6f7f5' }}>
                      <i className="bi bi-check-circle-fill" style={{ color: '#3DB39E', fontSize: 40 }}></i>
                    </div>
                    <h4 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>Message Sent!</h4>
                    <p className="text-muted mb-4">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button className="btn fw-semibold" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 8 }} onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>Send us a message</h4>
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold" style={{ color: '#6b7c93' }}>Full Name *</label>
                          <input type="text" name="name" className="form-control py-2" placeholder="Your name" value={form.name} onChange={handleChange} style={{ borderRadius: 8 }} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold" style={{ color: '#6b7c93' }}>Email Address *</label>
                          <input type="email" name="email" className="form-control py-2" placeholder="your@email.com" value={form.email} onChange={handleChange} style={{ borderRadius: 8 }} />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold" style={{ color: '#6b7c93' }}>Subject</label>
                        <input type="text" name="subject" className="form-control py-2" placeholder="How can we help?" value={form.subject} onChange={handleChange} style={{ borderRadius: 8 }} />
                      </div>
                      <div className="mb-4">
                        <label className="form-label small fw-semibold" style={{ color: '#6b7c93' }}>Message *</label>
                        <textarea name="message" className="form-control" rows={5} placeholder="Your message..." value={form.message} onChange={handleChange} style={{ borderRadius: 8 }} />
                      </div>
                      <button type="submit" className="btn px-5 py-2 fw-semibold text-white" style={{ background: '#1B6EB5', border: 'none', borderRadius: 10 }}>
                        <i className="bi bi-send me-2"></i>Send Message
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section style={{ background: '#e8f0fe', height: 300 }}>
        <div className="container h-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-geo-alt-fill" style={{ fontSize: 48, color: '#1B6EB5' }}></i>
            <h5 className="fw-bold mt-2" style={{ color: '#1a1a2e' }}>123 Health Avenue, Medical District</h5>
            <p className="text-muted">Mumbai, Maharashtra 400001</p>
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
