import { Link } from 'react-router-dom';
import ClinicForgeLogo from '../../components/ClinicForgeLogo';

export default function PrivacyPolicy() {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg fixed-top" style={{ background: '#fff', boxShadow: '0 2px 20px rgba(27,110,181,0.10)', zIndex: 1050 }}>
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold fs-4 text-decoration-none d-flex align-items-center gap-2" style={{ color: '#1B6EB5' }}>
            <ClinicForgeLogo size={38} />
            Clinic Forge
          </Link>
          <div className="d-flex gap-2">
            <Link to="/login" className="btn btn-outline-primary px-4 fw-semibold" style={{ borderColor: '#1B6EB5', color: '#1B6EB5', borderRadius: 8 }}>Sign In</Link>
          </div>
        </div>
      </nav>

      <section style={{ paddingTop: 100, minHeight: '100vh', background: '#f8faff' }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 p-4 p-lg-5 shadow-sm" style={{ borderRadius: 16 }}>
                <h1 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>Privacy Policy</h1>
                <p className="text-muted mb-4">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <Section title="1. Information We Collect">
                  <p>When you register and use Clinic Forge, we collect:</p>
                  <ul>
                    <li><strong>Account Information:</strong> Name, email address, phone number, and password (encrypted).</li>
                    <li><strong>Profile Information:</strong> Date of birth, gender, blood group, address, and profile photo (optional).</li>
                    <li><strong>Medical Information:</strong> Appointment details, prescriptions, medical documents you upload, and feedback you provide.</li>
                    <li><strong>Usage Data:</strong> Login activity and feature usage for improving our services.</li>
                  </ul>
                </Section>

                <Section title="2. How We Use Your Information">
                  <ul>
                    <li>To provide and manage your appointments with healthcare providers.</li>
                    <li>To enable doctors to view relevant patient information during consultations.</li>
                    <li>To store and display your prescriptions and medical documents.</li>
                    <li>To send notifications about appointment status changes.</li>
                    <li>To facilitate the feedback and review system.</li>
                    <li>To improve our platform and user experience.</li>
                  </ul>
                </Section>

                <Section title="3. Data Sharing">
                  <p>We do not sell or rent your personal data to third parties. Your information is shared only with:</p>
                  <ul>
                    <li><strong>Your assigned doctors:</strong> For consultation and treatment purposes.</li>
                    <li><strong>Platform administrators:</strong> For operational management and support.</li>
                  </ul>
                  <p>Your feedback and reviews may be publicly visible to other patients to help them make informed decisions about healthcare providers.</p>
                </Section>

                <Section title="4. Data Security">
                  <p>We implement industry-standard security measures including:</p>
                  <ul>
                    <li>JWT-based authentication with secure token management.</li>
                    <li>Password encryption using BCrypt hashing.</li>
                    <li>Role-based access control (Patient, Doctor, Admin).</li>
                    <li>HTTPS encryption for all data transmission.</li>
                  </ul>
                </Section>

                <Section title="5. Your Rights">
                  <p>You have the right to:</p>
                  <ul>
                    <li>Access and update your personal information through your profile.</li>
                    <li>Request deletion of your account and associated data.</li>
                    <li>Download your medical records and appointment history.</li>
                  </ul>
                </Section>

                <Section title="6. Contact Us">
                  <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                  <p><strong>Email:</strong> support@clinicforge.com<br /><strong>Phone:</strong> +91 123 456 7890</p>
                </Section>

                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e8eef3' }}>
                  <Link to="/" className="btn fw-semibold" style={{ color: '#1B6EB5' }}>
                    <i className="bi bi-arrow-left me-2"></i>Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h5 className="fw-bold mb-3" style={{ color: '#1a1a2e' }}>{title}</h5>
      <div style={{ color: '#6b7c93', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}
