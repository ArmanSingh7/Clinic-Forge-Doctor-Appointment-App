import { useEffect, useState } from 'react';
import { getAllDoctors, getDoctorsBySpeciality, getFeedbacksByDoctor, getAvailabilityByDoctor } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const uniqueCities = [...new Set(doctors.map(d => d.city).filter(Boolean))].sort();
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await getAllDoctors();
      const list = res.data.data || [];
      const withRatings = await Promise.all(
        list.map(async (doc) => {
          try {
            const [fbRes, avRes] = await Promise.all([
              getFeedbacksByDoctor(doc.doctorId),
              getAvailabilityByDoctor(doc.doctorId),
            ]);
            const feedbacks = fbRes.data.data || [];
            const avgRating = feedbacks.length > 0
              ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
              : null;
            return { ...doc, avgRating, feedbackCount: feedbacks.length, availability: avRes.data.data || [] };
          } catch {
            return { ...doc, avgRating: null, feedbackCount: 0, availability: [] };
          }
        })
      );
      setDoctors(withRatings);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filtered = doctors.filter(
    (d) =>
      (d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospitalName?.toLowerCase().includes(search.toLowerCase()))&&  
      (!locationFilter || d.city === locationFilter) &&
      (!ratingFilter || (d.avgRating && parseFloat(d.avgRating) >= parseFloat(ratingFilter)))
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-heart-pulse me-2 text-info"></i>Find Doctors
        </h4>
      </div>

      <div className="row g-3 mb-4">
  <div className="col-md-6">
    <div className="input-group shadow-sm">
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-search text-muted"></i>
      </span>
      <input
        className="form-control border-start-0"
        placeholder="Search by name, speciality, or hospital..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  </div>
  <div className="col-md-3">
    <div className="input-group shadow-sm">
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-geo-alt text-muted"></i>
      </span>
      <select
        className="form-select border-start-0"
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
      >
        <option value="">All Cities</option>
        {uniqueCities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  </div>
  <div className="col-md-3">
    <div className="input-group shadow-sm">
      <span className="input-group-text bg-white border-end-0">
        <i className="bi bi-star text-muted"></i>
      </span>
      <select
        className="form-select border-start-0"
        value={ratingFilter}
        onChange={(e) => setRatingFilter(e.target.value)}
      >
        <option value="">All Ratings</option>
        <option value="4">4+ Stars</option>
        <option value="3">3+ Stars</option>
        <option value="2">2+ Stars</option>
        <option value="1">1+ Stars</option>
      </select>
    </div>
  </div>
</div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-info" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-search fs-1 d-block mb-2"></i>
          No doctors found
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((doc) => (
            <div key={doc.doctorId} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start mb-3">
                    {doc.profilePhoto ? (
                      <img src={doc.profilePhoto} alt={doc.doctorName} className="rounded-circle me-3" style={{ width: 48, height: 48, minWidth: 48, objectFit: 'cover', border: '2px solid #0dcaf0' }} />
                    ) : (
                      <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center me-3" style={{ width: 48, height: 48, minWidth: 48 }}>
                        <i className="bi bi-person-badge fs-4 text-info"></i>
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-0">{doc.doctorName}</h6>
                      <span className="badge bg-info bg-opacity-10 text-info mt-1">{doc.speciality}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <small className="text-muted"><i className="bi bi-building me-1"></i>{doc.hospitalName || 'N/A'}</small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted"><i className="bi bi-geo-alt me-1"></i>{doc.location || 'N/A'}</small>
                  </div>
                  <div className="mb-3 d-flex justify-content-between">
                    <small className="text-muted">
                      <i className="bi bi-currency-rupee me-1"></i>₹{doc.chargedPerVisit}/visit
                    </small>
                    {doc.avgRating && (
                      <small className="text-warning">
                        <i className="bi bi-star-fill me-1"></i>{doc.avgRating} ({doc.feedbackCount})
                      </small>
                    )}
                  </div>

                  {doc.availability.length > 0 ? (
                    <div className="mb-3 p-2 bg-success bg-opacity-10 rounded">
                      <small className="text-success fw-semibold"><i className="bi bi-calendar-check me-1"></i>Available:</small>
                      {doc.availability.map((a, i) => (
                        <div key={i}>
                          <small className="text-muted">
                            {format(new Date(a.fromDate), 'MMM dd')} - {format(new Date(a.endDate), 'MMM dd, yyyy')}
                          </small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3 p-2 bg-danger bg-opacity-10 rounded">
                      <small className="text-danger"><i className="bi bi-calendar-x me-1"></i>No availability set</small>
                    </div>
                  )}

                  <button
                    className="btn btn-info btn-sm text-white w-100"
                    onClick={() => navigate('/patient/book', { state: { doctor: doc } })}
                  >
                    <i className="bi bi-calendar-plus me-1"></i>Book Appointment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
