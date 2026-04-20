import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HeroBackground from '../components/HeroBackground';
import ClinicForgeLogo from '../components/ClinicForgeLogo';

const SPECIALIZATIONS = [
  { icon: 'bi-heart-pulse-fill', label: 'Cardiology' },
  { icon: 'bi-brain', label: 'Neurology' },
  { icon: 'bi-virus2', label: 'Oncology' },
  { icon: 'bi-droplet-fill', label: 'Nephrology' },
  { icon: 'bi-activity', label: 'Gastroenterology' },
  { icon: 'bi-person-arms-up', label: 'Orthopaedics' },
  { icon: 'bi-eye-fill', label: 'Ophthalmology' },
  { icon: 'bi-lungs-fill', label: 'Pulmonology' },
  { icon: 'bi-gender-female', label: 'Gynaecology' },
  { icon: 'bi-bandaid-fill', label: 'Dermatology' },
  { icon: 'bi-ear-fill', label: 'ENT' },
  { icon: 'bi-capsule-pill', label: 'Diabetes' },
  { icon: 'bi-clipboard2-pulse-fill', label: 'General Surgery' },
  { icon: 'bi-hearts', label: 'Vascular Surgery' },
  { icon: 'bi-person-fill-check', label: 'Internal Medicine' },
  { icon: 'bi-hospital-fill', label: 'Haematology' },
];

const TESTIMONIALS = [
  {
    name: 'Angela K.',
    role: 'Happy Patient',
    text: 'I recently had the pleasure of visiting Clinic Forge for a routine check-up and I couldn\'t be more impressed with the level of care I received.',
    rating: 5,
  },
  {
    name: 'Georgina W.',
    role: 'Happy Patient',
    text: 'Clinic Forge is not only highly skilled, but also has a wonderful approach that immediately put me at ease. Highly recommended!',
    rating: 5,
  },
  {
    name: 'Rajesh M.',
    role: 'Regular Patient',
    text: 'Booking appointments is so easy. The doctors are punctual, professional, and genuinely care about your well-being.',
    rating: 5,
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleBooking = () => navigate('/login');

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav
        className="navbar navbar-expand-lg fixed-top"
        style={{
          background: scrolled ? '#fff' : 'rgba(255,255,255,0.97)',
          boxShadow: scrolled ? '0 2px 20px rgba(27,110,181,0.10)' : '0 1px 6px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          zIndex: 1050,
        }}
      >
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold fs-4 text-decoration-none d-flex align-items-center gap-2" style={{ color: '#1B6EB5' }}>
            <ClinicForgeLogo size={38} />
            Clinic Forge
          </Link>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navMenu">
            <ul className="navbar-nav mx-auto gap-1">
              {[
                { label: 'Home', to: '/' },
                { label: 'Doctors', to: '/doctors' },
                { label: 'Services', to: '/services' },
                { label: 'About Us', to: '/about' },
              ].map((item) => (
                <li className="nav-item" key={item.label}>
                  <Link
                    to={item.to}
                    className="nav-link px-3 fw-500"
                    style={{ color: '#1a1a2e', fontSize: 15 }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="d-flex gap-2 mt-2 mt-lg-0">
              <Link to="/login" className="btn btn-outline-primary px-4 fw-semibold"
                style={{ borderColor: '#1B6EB5', color: '#1B6EB5', borderRadius: 8 }}>
                Sign In
              </Link>
              <Link to="/register" className="btn px-4 fw-semibold text-white"
                style={{ background: '#1B6EB5', borderRadius: 8, border: 'none' }}>
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        id="home"
        style={{
          paddingTop: 100,
          background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 60%, #d6eaff 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated hero background */}
        <HeroBackground />

        <div className="container py-5" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row align-items-center g-5">
            {/* Left Text */}
            <div className="col-lg-6">
              <span
                className="badge mb-3 px-3 py-2 rounded-pill"
                style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}
              >
                <i className="bi bi-heart-fill me-1" style={{ color: '#e84545' }}></i> Healthy Everyday!
              </span>
              <h1 className="fw-bold mb-3 lh-sm" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#1a1a2e' }}>
                Get a{' '}
                <span style={{ color: '#1B6EB5' }}>professional</span>
                <br />diagnosis in your
                <br />neighborhood
              </h1>
              <p className="text-muted mb-4" style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 480 }}>
                Leading experts in all major fields are just around the corner.
                Book your appointment today and experience world-class healthcare.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-5">
                <button
                  onClick={handleBooking}
                  className="btn btn-lg px-5 text-white fw-semibold"
                  style={{ background: '#1B6EB5', border: 'none', borderRadius: 10, boxShadow: '0 4px 16px rgba(27,110,181,0.3)' }}
                >
                  <i className="bi bi-calendar-plus me-2"></i>Book an Appointment
                </button>
                <Link
                  to="/doctors"
                  className="btn btn-lg px-5 fw-semibold"
                  style={{ background: '#fff', border: '2px solid #1B6EB5', color: '#1B6EB5', borderRadius: 10 }}
                >
                  <i className="bi bi-search me-2"></i>Find a Doctor
                </Link>
              </div>
              {/* Stats pills */}
              {/* <div className="d-flex flex-wrap gap-4">
                {[
                  { value: '40+', label: 'Expert Doctors', icon: 'bi-person-badge-fill', color: '#1B6EB5' },
                  { value: '24/7', label: 'Emergency Services', icon: 'bi-telephone-fill', color: '#3DB39E' },
                  { value: '5k+', label: 'Happy Patients', icon: 'bi-emoji-smile-fill', color: '#E8A838' },
                ].map((s) => (
                  <div key={s.label} className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 44, height: 44, background: `${s.color}18` }}>
                      <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 18 }}></i>
                    </div>
                    <div>
                      <div className="fw-bold" style={{ color: '#1a1a2e', fontSize: 18, lineHeight: 1.1 }}>{s.value}</div>
                      <div style={{ color: '#6b7c93', fontSize: 12 }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Right - Doctor image showcase */}
            <div className="col-lg-6 d-none d-lg-flex align-items-stretch gap-3" style={{ height: 500 }}>

              {/* ── Left: Raj Patel — tall card ── */}
              <div className="position-relative flex-shrink-0"
                style={{ width: '48%', borderRadius: 24, overflow: 'hidden', boxShadow: '0 12px 40px rgba(27,110,181,0.16)', background: '#fff' }}>
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=480&h=700&fit=crop&crop=top"
                  alt="Dr. Raj Patel"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                {/* Gradient overlay at bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(10,20,40,0.82) 0%, rgba(10,20,40,0.3) 55%, transparent 100%)',
                  padding: '28px 18px 18px',
                }}>
                  <div className="fw-bold text-white" style={{ fontSize: 15 }}>Dr. Raj Patel</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 6 }}>Cardiologist</div>
                  <div className="d-flex align-items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <i key={s} className="bi bi-star-fill" style={{ color: '#E8A838', fontSize: 10 }}></i>
                    ))}
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginLeft: 4 }}>5.0</span>
                  </div>
                </div>
                {/* Available badge */}
                <span className="position-absolute d-flex align-items-center gap-1 badge rounded-pill"
                  style={{ top: 14, right: 14, background: '#fff', color: '#3DB39E', fontSize: 11, fontWeight: 600, padding: '5px 10px', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3DB39E', display: 'inline-block' }}></span>
                  Available
                </span>
              </div>

              {/* ── Right column: Sarah + Raj stacked ── */}
              <div className="d-flex flex-column gap-3 flex-grow-1">

                {/* Sarah Mills */}
                <div className="position-relative flex-grow-1"
                  style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 8px 28px rgba(27,110,181,0.14)', background: '#fff' }}>
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=480&h=400&fit=crop&crop=top"
                    alt="Dr. Sarah Mills"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(10,20,40,0.80) 0%, rgba(10,20,40,0.25) 55%, transparent 100%)',
                    padding: '24px 16px 14px',
                  }}>
                    <div className="fw-bold text-white" style={{ fontSize: 14 }}>Dr. Sarah Mills</div>
                    <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginBottom: 5 }}>Neurologist</div>
                    <div className="d-flex align-items-center gap-1">
                      {[1,2,3,4].map(s => <i key={s} className="bi bi-star-fill" style={{ color: '#E8A838', fontSize: 10 }}></i>)}
                      <i className="bi bi-star-half" style={{ color: '#E8A838', fontSize: 10 }}></i>
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginLeft: 4 }}>4.8</span>
                    </div>
                  </div>
                  <span className="position-absolute d-flex align-items-center gap-1 badge rounded-pill"
                    style={{ top: 12, right: 12, background: '#fff', color: '#3DB39E', fontSize: 10, fontWeight: 600, padding: '4px 9px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3DB39E', display: 'inline-block' }}></span>
                    Available
                  </span>
                </div>

                {/* james Carter */}
                <div className="position-relative flex-grow-1"
                  style={{ borderRadius: 22, overflow: 'hidden', boxShadow: '0 8px 28px rgba(27,110,181,0.14)', background: '#fff' }}>
                  <img
                    src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=480&h=400&fit=crop&crop=top"
                    alt="Dr. Raj Patel"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(to top, rgba(10,20,40,0.80) 0%, rgba(10,20,40,0.25) 55%, transparent 100%)',
                    padding: '24px 16px 14px',
                  }}>
                    <div className="fw-bold text-white" style={{ fontSize: 14 }}>Dr. James Carter</div>
                    <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 12, marginBottom: 5 }}>Orthopaedics</div>
                    <div className="d-flex align-items-center gap-1">
                      {[1,2,3,4,5].map(s => <i key={s} className="bi bi-star-fill" style={{ color: '#E8A838', fontSize: 10 }}></i>)}
                      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginLeft: 4 }}>4.9</span>
                    </div>
                  </div>
                  <span className="position-absolute d-flex align-items-center gap-1 badge rounded-pill"
                    style={{ top: 12, right: 12, background: '#fff', color: '#3DB39E', fontSize: 10, fontWeight: 600, padding: '4px 9px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3DB39E', display: 'inline-block' }}></span>
                    Available
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Services ── */}
      <section id="services" className="py-5" style={{ background: '#fff' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 rounded-pill mb-2"
              style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 12, fontWeight: 600 }}>
              OUR SERVICES
            </span>
            <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>Our Core Services</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 500 }}>
              Everything you need to manage your healthcare journey — from booking to prescriptions.
            </p>
          </div>
          <div className="row g-4">
            {[
              {
                icon: 'bi-calendar2-plus-fill',
                title: 'Book an Appointment',
                desc: 'Browse available doctors, pick a convenient time slot, and instantly confirm your appointment — no phone calls needed.',
                color: '#1B6EB5',
                bg: '#e8f0fe',
                cta: 'Book Now',
              },
              {
                icon: 'bi-search-heart-fill',
                title: 'Find a Doctor',
                desc: 'Search doctors by specialization or name. View their profiles, qualifications, and patient reviews before you decide.',
                color: '#3DB39E',
                bg: '#e6f7f5',
                cta: 'Find Doctors',
              },
              {
                icon: 'bi-clock-history',
                title: 'Doctor Availability',
                desc: 'Doctors set their own weekly schedules. Always see real-time, up-to-date availability so you never miss an open slot.',
                color: '#E8A838',
                bg: '#fef6e6',
                cta: 'View Slots',
              },
              {
                icon: 'bi-capsule-pill',
                title: 'Prescriptions & Medicines',
                desc: 'After every confirmed appointment, doctors issue digital prescriptions directly accessible in your patient dashboard.',
                color: '#9B59B6',
                bg: '#f3ecfb',
                cta: 'View Records',
              },
              {
                icon: 'bi-chat-square-dots-fill',
                title: 'Feedback & Reviews',
                desc: 'Rate your experience and leave feedback for your doctor after each visit. Transparent reviews help others choose wisely.',
                color: '#E84545',
                bg: '#fdeaea',
                cta: 'Leave Feedback',
              },
              {
                icon: 'bi-file-earmark-medical-fill',
                title: 'Document Management',
                desc: 'Securely upload and store medical documents under your profile. Doctors can access them during your consultation.',
                color: '#1B6EB5',
                bg: '#e8f0fe',
                cta: 'Manage Docs',
              },
            ].map((svc) => (
              <div key={svc.title} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 h-100 p-4 dashboard-stat-card"
                  style={{ borderRadius: 16, background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
                >
                  <div className="rounded-circle d-flex align-items-center justify-content-center mb-4"
                    style={{ width: 64, height: 64, background: svc.bg }}>
                    <i className={`bi ${svc.icon}`} style={{ color: svc.color, fontSize: 26 }}></i>
                  </div>
                  <h5 className="fw-bold mb-2" style={{ color: '#1a1a2e', fontSize: 16 }}>{svc.title}</h5>
                  <p className="text-muted mb-3 flex-grow-1" style={{ fontSize: 14, lineHeight: 1.75 }}>{svc.desc}</p>
                  <button
                    className="btn btn-sm fw-semibold mt-auto"
                    onClick={handleBooking}
                    style={{ color: svc.color, background: svc.bg, border: 'none', borderRadius: 8, width: 'fit-content', padding: '6px 18px' }}
                  >
                    {svc.cta} <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 100%)' }} className="py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            {/* Left icons grid */}
            <div className="col-lg-5">
              <div className="position-relative" style={{ height: 380 }}>
                {/* Center circle */}
                <div className="rounded-circle d-flex align-items-center justify-content-center position-absolute"
                  style={{ width: 110, height: 110, background: '#1B6EB5', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 8px 30px rgba(27,110,181,0.35)', zIndex: 2 }}>
                  <i className="bi bi-hospital-fill text-white" style={{ fontSize: 42 }}></i>
                </div>
                {/* Orbiting icons */}
                {[
                  { icon: 'bi-heart-pulse-fill', top: '5%', left: '10%', color: '#1B6EB5', bg: '#e8f0fe' },
                  { icon: 'bi-brain', top: '5%', left: '60%', color: '#3DB39E', bg: '#e6f7f5' },
                  { icon: 'bi-gender-female', top: '38%', left: '2%', color: '#E8A838', bg: '#fef6e6' },
                  { icon: 'bi-person-arms-up', top: '68%', left: '10%', color: '#9B59B6', bg: '#f3ecfb' },
                  { icon: 'bi-eye-fill', top: '68%', left: '60%', color: '#1B6EB5', bg: '#e8f0fe' },
                  { icon: 'bi-clipboard2-pulse-fill', top: '38%', left: '82%', color: '#3DB39E', bg: '#e6f7f5' },
                ].map((item, i) => (
                  <div key={i} className="rounded-circle d-flex align-items-center justify-content-center position-absolute shadow"
                    style={{ width: 64, height: 64, background: item.bg, top: item.top, left: item.left, zIndex: 1 }}>
                    <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 26 }}></i>
                  </div>
                ))}
              </div>
            </div>
            {/* Right text */}
            <div className="col-lg-7">
              <span className="badge px-3 py-2 rounded-pill mb-2"
                style={{ background: '#1B6EB5', color: '#fff', fontSize: 12, fontWeight: 600 }}>
                WHY CHOOSE US
              </span>
              <h2 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>A place with medical excellency</h2>
              <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>
                Clinic Forge is committed to providing the highest standard of medical care. We combine experienced doctors,
                modern technology, and a patient-first approach to deliver exceptional healthcare.
              </p>
              {[
          
                'Expert Medical Team — highly skilled doctors, surgeons, and specialists',
                'Minimally invasive technologies including advanced diagnostics',
                'Comprehensive care across 16+ specializations',
                'Patient-Centric Approach — your health is our mission',
              ].map((point) => (
                <div key={point} className="d-flex align-items-start gap-2 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mt-1"
                    style={{ width: 22, height: 22, background: '#3DB39E', flexShrink: 0 }}>
                    <i className="bi bi-check text-white" style={{ fontSize: 13, fontWeight: 900 }}></i>
                  </div>
                  <span style={{ color: '#344', fontSize: 15, lineHeight: 1.6 }}>{point}</span>
                </div>
              ))}
              <button
                onClick={handleBooking}
                className="btn mt-2 px-5 py-2 fw-semibold text-white"
                style={{ background: '#1B6EB5', border: 'none', borderRadius: 10, boxShadow: '0 4px 14px rgba(27,110,181,0.25)' }}
              >
                Learn More <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specializations ── */}
      <section id="doctors" className="py-5" style={{ background: '#fff' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge px-3 py-2 rounded-pill mb-2"
              style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 12, fontWeight: 600 }}>
              SPECIALIZATIONS
            </span>
            <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>Find Your Specialist</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 480 }}>
              Browse our wide network of specialists. Sign in to view profiles and book directly.
            </p>
          </div>
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
            {SPECIALIZATIONS.map((sp) => (
              <div key={sp.label} className="col">
                <button
                  onClick={handleBooking}
                  className="card border w-100 text-center py-3 px-2 dashboard-stat-card"
                  style={{
                    borderRadius: 14, borderColor: '#e8eef3', background: '#fff',
                    cursor: 'pointer', transition: 'all 0.2s', boxShadow: 'none',
                  }}
                >
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                    style={{ width: 52, height: 52, background: '#e8f0fe' }}>
                    <i className={`bi ${sp.icon}`} style={{ color: '#1B6EB5', fontSize: 22 }}></i>
                  </div>
                  <small className="fw-semibold" style={{ color: '#1a1a2e', fontSize: 13 }}>{sp.label}</small>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: 'linear-gradient(135deg, #1B6EB5 0%, #155d9e 100%)' }} className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white mb-2">How It Works</h2>
            <p className="text-white-50">Get started with Clinic Forge in three simple steps</p>
          </div>
          <div className="row g-4 text-center">
            {[
              { step: '01', icon: 'bi-person-plus-fill', title: 'Create an Account', desc: 'Register as a patient in under a minute. It\'s free and secure.' },
              { step: '02', icon: 'bi-search-heart', title: 'Find Your Doctor', desc: 'Browse specialists, read reviews, and choose the right doctor for you.' },
              { step: '03', icon: 'bi-calendar2-check-fill', title: 'Book & Confirm', desc: 'Pick an available slot, confirm your appointment, and you\'re done!' },
            ].map((item, i) => (
              <div key={i} className="col-md-4">
                <div className="card border-0 h-100 p-4"
                  style={{ borderRadius: 18, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}>
                  <div className="fw-bold mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 48, lineHeight: 1 }}>{item.step}</div>
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)' }}>
                    <i className={`bi ${item.icon}`} style={{ color: '#fff', fontSize: 26 }}></i>
                  </div>
                  <h5 className="fw-bold text-white mb-2">{item.title}</h5>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to="/register" className="btn btn-lg px-5 py-3 fw-semibold"
              style={{ background: '#fff', color: '#1B6EB5', borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              <i className="bi bi-rocket-takeoff-fill me-2"></i>Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-5" style={{ background: '#f8faff' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <div className="mb-2" style={{ color: '#1B6EB5', fontSize: 32 }}>"</div>
            <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>What patients say about us</h2>
          </div>
          <div className="row g-4 justify-content-center">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="col-md-4">
                <div
                  className="card border-0 h-100 p-4"
                  style={{
                    borderRadius: 16,
                    background: i === activeTestimonial ? '#fff' : '#fff',
                    boxShadow: i === activeTestimonial
                      ? '0 8px 30px rgba(27,110,181,0.15)'
                      : '0 2px 12px rgba(0,0,0,0.05)',
                    border: i === activeTestimonial ? '2px solid #1B6EB5' : '2px solid transparent',
                    transition: 'all 0.4s ease',
                  }}
                >
                  <div className="mb-3">
                    {[...Array(t.rating)].map((_, si) => (
                      <i key={si} className="bi bi-star-fill me-1" style={{ color: '#E8A838', fontSize: 14 }}></i>
                    ))}
                  </div>
                  <p style={{ color: '#6b7c93', fontSize: 14, lineHeight: 1.8, fontStyle: 'italic' }}>"{t.text}"</p>
                  <div className="d-flex align-items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid #e8eef3' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 44, height: 44, background: '#e8f0fe', flexShrink: 0 }}>
                      <i className="bi bi-person-fill" style={{ color: '#1B6EB5', fontSize: 20 }}></i>
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ color: '#1a1a2e', fontSize: 14 }}>{t.name}</div>
                      <div style={{ color: '#6b7c93', fontSize: 12 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Dot indicators */}
          <div className="d-flex justify-content-center gap-2 mt-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                style={{
                  width: i === activeTestimonial ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === activeTestimonial ? '#1B6EB5' : '#c8d8ef',
                  border: 'none',
                  transition: 'all 0.3s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section id="about-us" className="py-5" style={{ background: '#fff' }}>
        <div className="container py-3">
          <div className="row align-items-center g-4 p-4 p-lg-5 rounded-4"
            style={{ background: 'linear-gradient(135deg, #e8f0fe 0%, #d6eaff 100%)', borderRadius: 20 }}>
            <div className="col-lg-7">
              <h3 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>Schedule your visit online</h3>
              <p className="text-muted mb-0" style={{ fontSize: 15, lineHeight: 1.7 }}>
                Sign in or create your free account to book appointments with verified doctors, manage your health records,
                and get personalized care — all from one place.
              </p>
            </div>
            <div className="col-lg-5 d-flex flex-wrap gap-3 justify-content-lg-end">
              <button onClick={handleBooking} className="btn px-4 py-2 fw-semibold text-white"
                style={{ background: '#1B6EB5', border: 'none', borderRadius: 10 }}>
                <i className="bi bi-calendar-plus me-2"></i>Book Appointment
              </button>
              <Link to="/register" className="btn px-4 py-2 fw-semibold"
                style={{ background: '#fff', color: '#1B6EB5', border: '2px solid #1B6EB5', borderRadius: 10 }}>
                <i className="bi bi-person-plus me-2"></i>Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0d1b2e', color: '#fff' }}>
        <div className="container py-5">
          <div className="row g-4">
            {/* Brand */}
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <ClinicForgeLogo size={38} />
                <span className="fw-bold fs-5" style={{ color: '#fff' }}>Clinic Forge</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.8 }}>
                Connecting patients with trusted doctors. Modern healthcare management — simplified.
              </p>
              <div className="d-flex gap-3 mt-3">
                {['facebook', 'twitter-x', 'instagram', 'linkedin'].map((icon) => (
                  <div key={icon} className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                    <i className={`bi bi-${icon}`} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}></i>
                  </div>
                ))}
              </div>
            </div>
            {/* Quick Links */}
            <div className="col-6 col-lg-2 offset-lg-1">
              <h6 className="fw-bold mb-3" style={{ color: '#fff' }}>Quick Links</h6>
              {[
                { label: 'Home', to: '/' },
                { label: 'Find Doctors', to: '/doctors' },
                { label: 'Services', to: '/services' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'FAQ', to: '/faq' },
              ].map((l) => (
                <div key={l.label} className="mb-2">
                  <Link to={l.to} style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14 }}
                    onMouseOver={(e) => e.target.style.color = '#1B6EB5'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.55)'}>
                    {l.label}
                  </Link>
                </div>
              ))}
            </div>
            {/* Services */}
            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3" style={{ color: '#fff' }}>Services</h6>
              {['General Care', 'Specialist Care', 'Surgical Care', 'Diagnostics'].map((l) => (
                <div key={l} className="mb-2">
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{l}</span>
                </div>
              ))}
            </div>
            {/* Contact */}
            <div className="col-lg-3">
              <h6 className="fw-bold mb-3" style={{ color: '#fff' }}>Contact</h6>
              {[
                { icon: 'bi-telephone-fill', text: '+123 456 7890' },
                { icon: 'bi-envelope-fill', text: 'support@clinicforge.com' },
                { icon: 'bi-geo-alt-fill', text: '123 Health Avenue, Medical District' },
              ].map((c) => (
                <div key={c.text} className="d-flex align-items-start gap-2 mb-2">
                  <i className={`bi ${c.icon} mt-1`} style={{ color: '#1B6EB5', flexShrink: 0 }}></i>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '2rem 0 1rem' }} />
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <small style={{ color: 'rgba(255,255,255,0.4)' }}>
              &copy; {new Date().getFullYear()} Clinic Forge. All rights reserved.
            </small>
            <small style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Link to="/privacy-policy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</Link>
              &nbsp;·&nbsp;
              <Link to="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms of Service</Link>
              &nbsp;·&nbsp;
              <Link to="/faq" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>FAQ</Link>
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
}
