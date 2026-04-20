import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFeedbacksByDoctor } from '../../services/api';
import toast from 'react-hot-toast';

export default function DoctorFeedbacks() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbacksByDoctor(user.profileId)
      .then((res) => setFeedbacks(res.data.data || []))
      .catch(() => toast.error('Failed to load feedbacks'))
      .finally(() => setLoading(false));
  }, []);

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : 'N/A';

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1B6EB5' }} /></div>;

  return (
    <div>
      <h4 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>
        <span className="d-inline-flex align-items-center justify-content-center me-2" style={{ width: 38, height: 38, borderRadius: '50%', background: '#e8f0fe' }}>
          <i className="bi bi-chat-dots-fill" style={{ color: '#1B6EB5', fontSize: '1rem' }}></i>
        </span>
        Patient Feedbacks
      </h4>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center p-4" style={{ borderRadius: 12 }}>
            <div className="d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff8e1' }}>
              <i className="bi bi-star-fill fs-4" style={{ color: '#E8A838' }}></i>
            </div>
            <h2 className="fw-bold" style={{ color: '#1a1a2e' }}>{avgRating}</h2>
            <small style={{ color: '#6b7c93' }}>Average Rating ({feedbacks.length} reviews)</small>
          </div>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="text-center py-5" style={{ color: '#6b7c93' }}>
          <i className="bi bi-chat-dots fs-1 d-block mb-2"></i>No feedbacks yet
        </div>
      ) : (
        <div className="row g-3">
          {feedbacks.map((fb) => (
            <div key={fb.feedbackId} className="col-md-6">
              <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      <div className="d-flex align-items-center justify-content-center me-2" style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f0fe', border: '2px solid #1B6EB5' }}>
                        <i className="bi bi-person" style={{ color: '#1B6EB5' }}></i>
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ color: '#1a1a2e' }}>{fb.patient?.patientName || 'Patient'}</div>
                        <small style={{ color: '#6b7c93' }}>{fb.patient?.email}</small>
                      </div>
                    </div>
                    <div style={{ color: '#E8A838' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i key={s} className={`bi ${s <= fb.rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="mb-0" style={{ color: '#6b7c93' }}>{fb.feedbackComment || 'No comment'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
