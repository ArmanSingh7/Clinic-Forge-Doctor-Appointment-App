import { Link } from 'react-router-dom';
import { useState } from 'react';
import ClinicForgeLogo from '../../components/ClinicForgeLogo';

const FAQ_CATEGORIES = [
  {
    id: 'general',
    label: 'General',
    icon: 'bi-info-circle-fill',
    color: '#1B6EB5',
    bg: '#e8f0fe',
    questions: [
      {
        q: 'What is Clinic Forge?',
        a: 'Clinic Forge is an online doctor appointment booking platform that connects patients with verified doctors across 16+ specializations. You can search for doctors, view their profiles and reviews, book appointments, and manage your health records — all from one place.',
      },
      {
        q: 'Is Clinic Forge free to use?',
        a: 'Creating an account and browsing doctors is completely free. You only pay the doctor\'s consultation fee when you book an appointment.',
      },
      {
        q: 'Do I need an account to browse doctors?',
        a: 'No! You can browse our doctor directory, view their specializations, ratings, and reviews without creating an account. However, you\'ll need to sign in to book appointments.',
      },
      {
        q: 'How do I contact support?',
        a: 'You can reach us through our Contact page, email us at support@clinicforge.com, or call +123 456 7890. We typically respond within 24 hours.',
      },
      {
        q: 'Is my personal data secure?',
        a: 'Yes. We use industry-standard JWT authentication, encrypted passwords, and secure data practices. Your medical records are only accessible to you and your treating doctor. See our Privacy Policy for details.',
      },
    ],
  },
  {
    id: 'patients',
    label: 'For Patients',
    icon: 'bi-person-fill',
    color: '#3DB39E',
    bg: '#e6f7f5',
    questions: [
      {
        q: 'How do I book an appointment?',
        a: 'Sign in to your patient account, go to "Find Doctors", select a doctor, choose an available date and time slot, add any remarks, and confirm your booking. You\'ll receive a notification once the doctor responds.',
      },
      {
        q: 'What are the appointment statuses?',
        a: 'Your appointment goes through these stages: PENDING (just booked, waiting for doctor) → APPROVED (doctor accepted) → CONFIRMED (doctor confirmed the final slot, time is locked in) → or CANCELLED/REJECTED if either party cancels.',
      },
      {
        q: 'Can I cancel my appointment?',
        a: 'Yes, you can cancel appointments that are in PENDING or APPROVED status. Once an appointment is CONFIRMED by the doctor, it cannot be cancelled through the app — please contact the doctor\'s office directly.',
      },
      {
        q: 'When can I leave feedback for a doctor?',
        a: 'You can leave feedback only after your appointment is CONFIRMED and the scheduled time has passed. This ensures reviews are based on actual visits. You\'ll see a feedback button appear once your appointment is completed.',
      },
      {
        q: 'How do I view my prescriptions?',
        a: 'After a confirmed appointment, your doctor may add prescriptions. Go to "My Appointments", click on the prescription icon next to any appointment to view medicines, dosage, and instructions.',
      },
      {
        q: 'Can I upload medical documents?',
        a: 'Yes! Go to your appointment details and upload relevant medical reports, test results, or previous prescriptions. Your doctor can access these during your consultation. Supported file size is up to 10MB.',
      },
      {
        q: 'How do I update my profile?',
        a: 'Navigate to "Profile" from the sidebar menu. You can update your personal details, contact information, address, and upload a profile photo.',
      },
    ],
  },
  {
    id: 'doctors',
    label: 'For Doctors',
    icon: 'bi-heart-pulse-fill',
    color: '#E8A838',
    bg: '#fef6e6',
    questions: [
      {
        q: 'How do I register as a doctor?',
        a: 'Click "Register" on the homepage, select "Doctor" as your role, and fill in your details including specialization, hospital, location, and consultation fee. Once registered, you can start setting your availability.',
      },
      {
        q: 'How do I set my availability?',
        a: 'Go to "Availability" from your dashboard sidebar. Set a date range (From Date → End Date) and the system will automatically generate 30-minute time slots from 9 AM to 5 PM for each day. Patients can then book these slots.',
      },
      {
        q: 'How does the appointment flow work?',
        a: 'When a patient books: you\'ll get a notification → Review and APPROVE or REJECT → Once approved, CONFIRM to lock the time slot → The patient visits at the scheduled time → After the visit, the patient can leave feedback.',
      },
      {
        q: 'Can I send emails to my patients?',
        a: 'Yes. From the "My Patients" section, you can send emails directly to patients for follow-ups, sharing reports, or any communication related to their care.',
      },
      {
        q: 'How do I add prescriptions?',
        a: 'After confirming an appointment, go to the appointment details and click "Add Prescription". You can add multiple medicines with dosage, frequency, duration, and special notes.',
      },
      {
        q: 'Can I view patient feedback?',
        a: 'Yes. Go to "Feedbacks" from your sidebar to see all patient reviews, ratings, and comments. You\'ll also receive a notification whenever a patient submits feedback.',
      },
      {
        q: 'How do I upload documents for a patient?',
        a: 'From the appointment details or patient history, use the document upload feature to share test results, medical reports, or any files with your patient.',
      },
    ],
  },
];

function AccordionItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="mb-2">
      <button
        className="btn w-100 text-start d-flex align-items-center justify-content-between py-3 px-4"
        onClick={onClick}
        style={{
          background: isOpen ? '#f8faff' : '#fff',
          border: `1px solid ${isOpen ? '#1B6EB5' : '#e8eef3'}`,
          borderRadius: 12,
          transition: 'all 0.2s ease',
        }}
      >
        <span className="fw-semibold" style={{ color: '#1a1a2e', fontSize: 14, lineHeight: 1.6, paddingRight: 16 }}>
          {question}
        </span>
        <i
          className={`bi ${isOpen ? 'bi-dash-circle' : 'bi-plus-circle'}`}
          style={{ color: '#1B6EB5', fontSize: 18, flexShrink: 0, transition: 'transform 0.2s' }}
        ></i>
      </button>
      <div
        style={{
          maxHeight: isOpen ? 300 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div className="px-4 py-3" style={{ color: '#6b7c93', fontSize: 14, lineHeight: 1.8 }}>
          {answer}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const currentCategory = FAQ_CATEGORIES.find(c => c.id === activeCategory);

  // Filter questions across all categories when searching
  const filteredQuestions = searchTerm.trim()
    ? FAQ_CATEGORIES.flatMap(cat =>
        cat.questions
          .filter(faq => faq.q.toLowerCase().includes(searchTerm.toLowerCase()) || faq.a.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(faq => ({ ...faq, category: cat.label, categoryColor: cat.color }))
      )
    : null;

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
          <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 12, fontWeight: 600 }}>HELP CENTER</span>
          <h1 className="fw-bold mb-3" style={{ color: '#1a1a2e', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>
            Frequently Asked Questions
          </h1>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: 560 }}>
            Find answers to common questions about using Clinic Forge. Can't find what you're looking for? <Link to="/contact" style={{ color: '#1B6EB5' }}>Contact us</Link>.
          </p>
          {/* Search */}
          <div className="mx-auto" style={{ maxWidth: 480 }}>
            <div className="input-group" style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(27,110,181,0.10)' }}>
              <span className="input-group-text bg-white border-0 ps-4">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 py-3"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setOpenIndex(0); }}
                style={{ fontSize: 15 }}
              />
              {searchTerm && (
                <button className="btn bg-white border-0 pe-4" onClick={() => setSearchTerm('')}>
                  <i className="bi bi-x-lg text-muted"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          {/* Search results mode */}
          {filteredQuestions ? (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <p className="text-muted mb-4">
                <i className="bi bi-search me-2"></i>
                {filteredQuestions.length} result{filteredQuestions.length !== 1 ? 's' : ''} for "{searchTerm}"
              </p>
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-emoji-frown fs-1 text-muted d-block mb-3"></i>
                  <p className="text-muted">No matching questions found. Try different keywords or <Link to="/contact" style={{ color: '#1B6EB5' }}>contact us</Link>.</p>
                </div>
              ) : (
                filteredQuestions.map((faq, i) => (
                  <div key={i}>
                    <small className="text-muted mb-1 d-block" style={{ fontSize: 11 }}>
                      <i className="bi bi-tag-fill me-1" style={{ color: faq.categoryColor }}></i>{faq.category}
                    </small>
                    <AccordionItem
                      question={faq.q}
                      answer={faq.a}
                      isOpen={openIndex === i}
                      onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                    />
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Category browse mode */
            <div className="row g-4">
              {/* Category tabs - sidebar */}
              <div className="col-lg-4">
                <div className="sticky-top" style={{ top: 100 }}>
                  <h6 className="fw-bold text-muted mb-3" style={{ fontSize: 12, letterSpacing: 1 }}>CATEGORIES</h6>
                  {FAQ_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      className="btn w-100 text-start d-flex align-items-center gap-3 mb-2 py-3 px-3"
                      onClick={() => { setActiveCategory(cat.id); setOpenIndex(0); }}
                      style={{
                        background: activeCategory === cat.id ? cat.bg : '#fff',
                        border: `1px solid ${activeCategory === cat.id ? cat.color + '40' : '#e8eef3'}`,
                        borderRadius: 12,
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: 40, height: 40, background: activeCategory === cat.id ? cat.color : '#f1f3f5', flexShrink: 0 }}
                      >
                        <i className={`bi ${cat.icon}`} style={{ color: activeCategory === cat.id ? '#fff' : cat.color, fontSize: 16 }}></i>
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ color: activeCategory === cat.id ? cat.color : '#1a1a2e', fontSize: 14 }}>
                          {cat.label}
                        </div>
                        <small className="text-muted" style={{ fontSize: 12 }}>
                          {cat.questions.length} question{cat.questions.length !== 1 ? 's' : ''}
                        </small>
                      </div>
                    </button>
                  ))}

                  {/* Quick help card */}
                  <div className="mt-4 p-4 rounded-3 text-center" style={{ background: '#f8faff', border: '1px solid #e8eef3' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: 48, height: 48, background: '#e8f0fe' }}>
                      <i className="bi bi-headset" style={{ color: '#1B6EB5', fontSize: 22 }}></i>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ color: '#1a1a2e', fontSize: 14 }}>Still need help?</h6>
                    <p className="text-muted mb-3" style={{ fontSize: 13 }}>Our support team is here to help</p>
                    <Link to="/contact" className="btn btn-sm fw-semibold px-4"
                      style={{ background: '#1B6EB5', color: '#fff', borderRadius: 8, border: 'none' }}>
                      <i className="bi bi-envelope me-1"></i>Contact Us
                    </Link>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="col-lg-8">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 44, height: 44, background: currentCategory.bg }}>
                    <i className={`bi ${currentCategory.icon}`} style={{ color: currentCategory.color, fontSize: 20 }}></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>{currentCategory.label}</h4>
                    <small className="text-muted">{currentCategory.questions.length} questions</small>
                  </div>
                </div>
                {currentCategory.questions.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openIndex === i}
                    onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1B6EB5 0%, #155d9e 100%)' }}>
        <div className="container text-center py-3">
          <h3 className="fw-bold text-white mb-2">Ready to get started?</h3>
          <p className="text-white-50 mb-4">Join thousands of patients and doctors on Clinic Forge</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn btn-lg px-5 py-3 fw-semibold"
              style={{ background: '#fff', color: '#1B6EB5', borderRadius: 12, border: 'none' }}>
              <i className="bi bi-person-plus-fill me-2"></i>Create Account
            </Link>
            <Link to="/doctors" className="btn btn-lg px-5 py-3 fw-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)' }}>
              <i className="bi bi-search me-2"></i>Browse Doctors
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
