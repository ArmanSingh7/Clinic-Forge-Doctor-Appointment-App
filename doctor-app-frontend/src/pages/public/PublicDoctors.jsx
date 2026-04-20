import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllDoctors, getFeedbacksByDoctor } from '../../services/api';
import ClinicForgeLogo from '../../components/ClinicForgeLogo';

const SPECIALIZATIONS = [
  'All', 'Physician', 'Cardiologist', 'Dermatologist', 'Dentist', 'ENT',
  'Gastroenterologist', 'Gynecologist', 'Neurologist', 'Oncologist',
  'Ophthalmologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist',
  'Pulmonologist', 'Radiologist', 'Surgeon', 'Urologist',
];

export default function PublicDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewsModal, setReviewsModal] = useState({ open: false, doctor: null, feedbacks: [] });

  useEffect(() => { loadDoctors(); }, []);

  const loadDoctors = async () => {
    try {
      const res = await getAllDoctors();
      const list = res.data.data || [];
      const withRatings = await Promise.all(
        list.map(async (doc) => {
          try {
            const fbRes = await getFeedbacksByDoctor(doc.doctorId);
            const feedbacks = fbRes.data.data || [];
            const avgRating = feedbacks.length > 0
              ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
              : null;
            return { ...doc, avgRating, feedbackCount: feedbacks.length, feedbacks };
          } catch {
            return { ...doc, avgRating: null, feedbackCount: 0, feedbacks: [] };
          }
        })
      );
      setDoctors(withRatings);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const uniqueCities = [...new Set(doctors.map(d => d.city).filter(Boolean))].sort();

  const filtered = doctors.filter(d =>
    (specFilter === 'All' || d.speciality === specFilter) &&
    (!cityFilter || d.city === cityFilter) &&
    (!search || d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospitalName?.toLowerCase().includes(search.toLowerCase()))
  );

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
                  <Link to={item.to} className="nav-link px-3 fw-500" style={{ color: item.to === '/doctors' ? '#1B6EB5' : '#1a1a2e', fontSize: 15 }}>{item.label}</Link>
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
          <span className="badge px-3 py-2 rounded-pill mb-3" style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 12, fontWeight: 600 }}>OUR DOCTORS</span>
          <h1 className="fw-bold mb-3" style={{ color: '#1a1a2e', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>Meet Our Expert Doctors</h1>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: 560 }}>
            Browse our network of highly qualified specialists. View their profiles, specializations, and patient reviews.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4" style={{ background: '#fff', borderBottom: '1px solid #e8eef3' }}>
        <div className="container">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input type="text" className="form-control border-start-0" placeholder="Search doctors, specializations..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Specializations' : s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                <option value="">All Cities</option>
                {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-2 text-muted" style={{ fontSize: '0.9rem' }}>
              {filtered.length} doctor{filtered.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Cards */}
      <section className="py-5" style={{ background: '#f8faff', minHeight: '50vh' }}>
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#1B6EB5' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-search fs-1 d-block mb-2"></i>
              <p>No doctors found matching your criteria</p>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map(doc => (
                <div key={doc.doctorId} className="col-md-6 col-lg-4">
                  <div className="card border-0 h-100 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <div className="p-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        {doc.profilePhoto ? (
                          <img src={doc.profilePhoto} alt={doc.doctorName} className="rounded-circle" style={{ width: 64, height: 64, objectFit: 'cover', border: '3px solid #e8f0fe' }} />
                        ) : (
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, background: '#e8f0fe', border: '3px solid #d0dce8' }}>
                            <i className="bi bi-person-fill fs-3" style={{ color: '#1B6EB5' }}></i>
                          </div>
                        )}
                        <div>
                          <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Dr. {doc.doctorName}</h6>
                          <span className="badge rounded-pill mt-1" style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: '0.75rem' }}>{doc.speciality}</span>
                        </div>
                      </div>

                      {doc.hospitalName && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-hospital text-muted" style={{ fontSize: '0.85rem' }}></i>
                          <small style={{ color: '#6b7c93' }}>{doc.hospitalName}</small>
                        </div>
                      )}
                      {doc.city && (
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-geo-alt text-muted" style={{ fontSize: '0.85rem' }}></i>
                          <small style={{ color: '#6b7c93' }}>{doc.location ? `${doc.location}, ` : ''}{doc.city}</small>
                        </div>
                      )}
                      {doc.chargedPerVisit && (
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-currency-rupee text-muted" style={{ fontSize: '0.85rem' }}></i>
                          <small className="fw-semibold" style={{ color: '#198754' }}>₹{doc.chargedPerVisit} per visit</small>
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-between pt-3" style={{ borderTop: '1px solid #f1f3f5' }}>
                        <div className="d-flex align-items-center gap-1" style={{ cursor: doc.feedbackCount > 0 ? 'pointer' : 'default' }}
                          onClick={() => doc.feedbackCount > 0 && setReviewsModal({ open: true, doctor: doc, feedbacks: doc.feedbacks })}
                          title={doc.feedbackCount > 0 ? 'Click to see reviews' : ''}>
                          {doc.avgRating ? (
                            <>
                              <i className="bi bi-star-fill" style={{ color: '#E8A838', fontSize: '0.85rem' }}></i>
                              <span className="fw-semibold" style={{ color: '#1a1a2e', fontSize: '0.85rem' }}>{doc.avgRating}</span>
                              <small className="text-muted" style={{ textDecoration: 'underline' }}>({doc.feedbackCount} review{doc.feedbackCount !== 1 ? 's' : ''})</small>
                            </>
                          ) : (
                            <small className="text-muted">No reviews yet</small>
                          )}
                        </div>
                        <Link to="/login" className="btn btn-sm fw-semibold" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 8, fontSize: '0.8rem' }}>
                          Book Now <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1B6EB5 0%, #155d9e 100%)' }}>
        <div className="container text-center py-3">
          <h3 className="fw-bold text-white mb-2">Ready to book your appointment?</h3>
          <p className="text-white-50 mb-4">Create a free account to book with any of our doctors</p>
          <Link to="/register" className="btn btn-lg px-5 py-3 fw-semibold" style={{ background: '#fff', color: '#1B6EB5', borderRadius: 12, border: 'none' }}>
            <i className="bi bi-person-plus-fill me-2"></i>Get Started Free
          </Link>
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

      {/* Reviews Modal */}
      {reviewsModal.open && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={() => setReviewsModal({ open: false, doctor: null, feedbacks: [] })}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 pb-0" style={{ padding: '24px 24px 12px' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-1" style={{ color: '#1a1a2e' }}>
                    Reviews for Dr. {reviewsModal.doctor?.doctorName}
                  </h5>
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center gap-1">
                      <i className="bi bi-star-fill" style={{ color: '#E8A838', fontSize: 14 }}></i>
                      <span className="fw-semibold" style={{ fontSize: 14 }}>{reviewsModal.doctor?.avgRating}</span>
                    </div>
                    <small className="text-muted">({reviewsModal.feedbacks.length} review{reviewsModal.feedbacks.length !== 1 ? 's' : ''})</small>
                    {reviewsModal.doctor?.speciality && (
                      <span className="badge rounded-pill" style={{ background: '#e8f0fe', color: '#1B6EB5', fontSize: 11 }}>{reviewsModal.doctor.speciality}</span>
                    )}
                  </div>
                </div>
                <button className="btn-close" onClick={() => setReviewsModal({ open: false, doctor: null, feedbacks: [] })}></button>
              </div>
              <div className="modal-body" style={{ padding: '16px 24px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
                {/* Rating breakdown */}
                <div className="mb-4 p-3 rounded-3" style={{ background: '#f8faff' }}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviewsModal.feedbacks.filter(f => f.rating === star).length;
                    const pct = reviewsModal.feedbacks.length > 0 ? (count / reviewsModal.feedbacks.length) * 100 : 0;
                    return (
                      <div key={star} className="d-flex align-items-center gap-2 mb-1">
                        <small className="text-muted" style={{ width: 20, textAlign: 'right' }}>{star}</small>
                        <i className="bi bi-star-fill" style={{ color: '#E8A838', fontSize: 11 }}></i>
                        <div className="flex-grow-1" style={{ height: 8, background: '#e8eef3', borderRadius: 4 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#E8A838', borderRadius: 4, transition: 'width 0.3s' }}></div>
                        </div>
                        <small className="text-muted" style={{ width: 24, fontSize: 12 }}>{count}</small>
                      </div>
                    );
                  })}
                </div>
                {/* Individual reviews */}
                {reviewsModal.feedbacks.length === 0 ? (
                  <p className="text-muted text-center py-3">No reviews yet</p>
                ) : (
                  reviewsModal.feedbacks.map((fb, i) => (
                    <div key={fb.feedbackId || i} className="mb-3 p-3 rounded-3" style={{ background: '#fff', border: '1px solid #e8eef3' }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: '#e8f0fe' }}>
                            <i className="bi bi-person-fill" style={{ color: '#1B6EB5', fontSize: 16 }}></i>
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ fontSize: 13, color: '#1a1a2e' }}>
                              {fb.patient?.patientName || 'Patient'}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          {[...Array(5)].map((_, si) => (
                            <i key={si} className={`bi ${si < fb.rating ? 'bi-star-fill' : 'bi-star'}`} style={{ color: '#E8A838', fontSize: 12 }}></i>
                          ))}
                        </div>
                      </div>
                      {fb.feedbackComment && (
                        <p className="mb-0" style={{ color: '#6b7c93', fontSize: 13, lineHeight: 1.7 }}>
                          "{fb.feedbackComment}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
