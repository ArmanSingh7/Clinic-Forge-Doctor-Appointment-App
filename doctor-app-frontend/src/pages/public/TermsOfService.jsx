import { Link } from 'react-router-dom';
import ClinicForgeLogo from '../../components/ClinicForgeLogo';

export default function TermsOfService() {
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
                <h1 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>Terms of Service</h1>
                <p className="text-muted mb-4">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <Section title="1. Acceptance of Terms">
                  <p>By accessing or using Clinic Forge, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                </Section>

                <Section title="2. Description of Service">
                  <p>Clinic Forge is a healthcare management platform that enables:</p>
                  <ul>
                    <li>Patients to search for doctors, book appointments, view prescriptions, and manage medical records.</li>
                    <li>Doctors to manage their availability, handle appointments, and prescribe medicines.</li>
                    <li>Administrators to oversee platform operations.</li>
                  </ul>
                </Section>

                <Section title="3. User Accounts">
                  <ul>
                    <li>You must provide accurate, complete information during registration.</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    <li>You must not share your account or allow unauthorized access.</li>
                    <li>You must immediately notify us of any unauthorized use of your account.</li>
                  </ul>
                </Section>

                <Section title="4. User Responsibilities">
                  <p><strong>For Patients:</strong></p>
                  <ul>
                    <li>Provide accurate health information for consultations.</li>
                    <li>Attend booked appointments or cancel in a timely manner.</li>
                    <li>Provide honest and respectful feedback and reviews.</li>
                  </ul>
                  <p><strong>For Doctors:</strong></p>
                  <ul>
                    <li>Maintain accurate availability schedules.</li>
                    <li>Provide professional medical care and accurate prescriptions.</li>
                    <li>Handle patient information with confidentiality.</li>
                  </ul>
                </Section>

                <Section title="5. Medical Disclaimer">
                  <p>Clinic Forge is a platform for connecting patients with healthcare providers. We do not provide medical advice, diagnosis, or treatment. All medical decisions should be made in consultation with qualified healthcare professionals.</p>
                  <p>Doctor profiles, ratings, and reviews on our platform are for informational purposes and should not be the sole basis for medical decisions.</p>
                </Section>

                <Section title="6. Appointment Policy">
                  <ul>
                    <li>Appointments are subject to doctor approval.</li>
                    <li>Cancellations should be made as early as possible.</li>
                    <li>Consultation fees are as displayed on doctor profiles and may vary.</li>
                  </ul>
                </Section>

                <Section title="7. Intellectual Property">
                  <p>All content, design, and functionality of Clinic Forge are owned by us and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.</p>
                </Section>

                <Section title="8. Limitation of Liability">
                  <p>Clinic Forge shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. We do not guarantee uninterrupted service availability.</p>
                </Section>

                <Section title="9. Changes to Terms">
                  <p>We reserve the right to modify these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
                </Section>

                <Section title="10. Contact">
                  <p>For questions about these Terms, contact us at:</p>
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
