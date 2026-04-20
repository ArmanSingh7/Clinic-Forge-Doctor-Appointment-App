import { useEffect, useState, useMemo } from 'react';
import { getAllDoctors, getFeedbacksByDoctor } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminFeedbacks() {
  const [feedbacksByDoctor, setFeedbacksByDoctor] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const docRes = await getAllDoctors();
      const doctors = docRes.data.data || [];
      const allFeedbacks = await Promise.all(
        doctors.map(async (doc) => {
          try {
            const fbRes = await getFeedbacksByDoctor(doc.doctorId);
            return { doctor: doc, feedbacks: fbRes.data.data || [] };
          } catch {
            return { doctor: doc, feedbacks: [] };
          }
        })
      );
      setFeedbacksByDoctor(allFeedbacks.filter((item) => item.feedbacks.length > 0));
    } catch {
      toast.error('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  // Top rated doctors sorted by average rating
  const topRatedDoctors = useMemo(() => {
    return feedbacksByDoctor
      .map(({ doctor, feedbacks }) => ({
        doctor,
        avgRating: (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1),
        feedbackCount: feedbacks.length,
      }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);
  }, [feedbacksByDoctor]);

  // All feedbacks flattened and sorted by most recent (highest feedbackId first)
  const recentFeedbacks = useMemo(() => {
    return feedbacksByDoctor
      .flatMap(({ doctor, feedbacks }) =>
        feedbacks.map((fb) => ({ ...fb, doctorName: doctor.doctorName, speciality: doctor.speciality }))
      )
      .sort((a, b) => b.feedbackId - a.feedbackId)
      .slice(0, 10);
  }, [feedbacksByDoctor]);

  // Stats
  const totalFeedbacks = useMemo(() => feedbacksByDoctor.reduce((s, item) => s + item.feedbacks.length, 0), [feedbacksByDoctor]);
  const overallAvg = useMemo(() => {
    const all = feedbacksByDoctor.flatMap((item) => item.feedbacks);
    return all.length > 0 ? (all.reduce((s, f) => s + f.rating, 0) / all.length).toFixed(1) : '0.0';
  }, [feedbacksByDoctor]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-info" /></div>;

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const INITIALS_COLORS = ['#0dcaf0', '#6f42c1', '#198754', '#fd7e14', '#dc3545', '#0d6efd'];

  return (
    <div>
      <h4 className="fw-bold mb-4"><i className="bi bi-chat-dots me-2 text-info"></i>Feedback Dashboard</h4>

      {feedbacksByDoctor.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-chat-dots fs-1 d-block mb-2"></i>No feedbacks yet
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-chat-dots-fill text-info fs-5"></i>
                  </div>
                  <h4 className="fw-bold mb-0">{totalFeedbacks}</h4>
                  <small className="text-muted">Total Feedbacks</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div className="rounded-circle bg-warning bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-star-fill text-warning fs-5"></i>
                  </div>
                  <h4 className="fw-bold mb-0">{overallAvg}</h4>
                  <small className="text-muted">Average Rating</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-person-badge-fill text-success fs-5"></i>
                  </div>
                  <h4 className="fw-bold mb-0">{feedbacksByDoctor.length}</h4>
                  <small className="text-muted">Doctors Reviewed</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center py-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-trophy-fill text-primary fs-5"></i>
                  </div>
                  <h4 className="fw-bold mb-0">{topRatedDoctors[0]?.avgRating || '-'}</h4>
                  <small className="text-muted">Highest Rating</small>
                </div>
              </div>
            </div>
          </div>

          {/* Top Rated Doctors & Recent Feedbacks */}
          <div className="row g-4">
            {/* Top Rated Doctors */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <h6 className="fw-bold mb-0"><i className="bi bi-trophy me-2 text-warning"></i>Top Rated Doctors</h6>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {topRatedDoctors.map(({ doctor, avgRating, feedbackCount }, idx) => (
                      <div key={doctor.doctorId} className="list-group-item d-flex align-items-center py-3 px-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center me-3 text-white fw-bold"
                          style={{ width: 42, height: 42, minWidth: 42, backgroundColor: INITIALS_COLORS[idx % INITIALS_COLORS.length], fontSize: '0.85rem' }}
                        >
                          {getInitials(doctor.doctorName)}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold">Dr. {doctor.doctorName}</div>
                          <small className="text-muted">{doctor.speciality}</small>
                        </div>
                        <div className="text-end">
                          <span className="text-warning fw-bold">
                            <i className="bi bi-star-fill me-1"></i>{avgRating}
                          </span>
                          <br />
                          <small className="text-muted">{feedbackCount} reviews</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Feedbacks */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white border-bottom">
                  <h6 className="fw-bold mb-0"><i className="bi bi-clock-history me-2 text-info"></i>Recent Feedbacks</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th className="text-muted small fw-semibold">Patient</th>
                          <th className="text-muted small fw-semibold">Doctor</th>
                          <th className="text-muted small fw-semibold">Rating</th>
                          <th className="text-muted small fw-semibold">Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentFeedbacks.map((fb) => (
                          <tr key={fb.feedbackId}>
                            <td className="fw-medium">{fb.patient?.patientName || 'Patient'}</td>
                            <td>Dr. {fb.doctorName}</td>
                            <td>
                              <div className="text-warning text-nowrap">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <i key={s} className={`bi ${s <= fb.rating ? 'bi-star-fill' : 'bi-star'}`} style={{ fontSize: '0.85rem' }}></i>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className="text-muted small" style={{ maxWidth: 200, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fb.feedbackComment || ''}>
                                {fb.feedbackComment || 'No comment'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
