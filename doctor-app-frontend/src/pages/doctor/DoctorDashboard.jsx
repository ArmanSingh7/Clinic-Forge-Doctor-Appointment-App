import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsByDoctor, getFeedbacksByDoctor, getPatientsByDoctor, getDoctorById, approveAppointment, rejectAppointment, confirmAppointment, sendDoctorEmail } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-bootstrap';

const PIE_COLORS = ['#1B6EB5', '#E8A838', '#3DB39E'];

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Email modal state
  const [emailModal, setEmailModal] = useState({ show: false, to: '', patientName: '' });
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Approve/Reject with message modal
  const [actionModal, setActionModal] = useState({ show: false, aptId: null, action: '', patientEmail: '', patientName: '' });
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [docRes, aptRes, patRes, fbRes] = await Promise.all([
        getDoctorById(user.profileId),
        getAppointmentsByDoctor(user.profileId),
        getPatientsByDoctor(user.profileId),
        getFeedbacksByDoctor(user.profileId),
      ]);
      setDoctor(docRes.data.data);
      setAppointments(aptRes.data.data || []);
      setPatients(patRes.data.data || []);
      setFeedbacks(fbRes.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      toast.success('Appointment approved');
      loadData();
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    try {
      await rejectAppointment(id);
      toast.success('Appointment rejected');
      loadData();
    } catch { toast.error('Failed to reject'); }
  };

  const handleConfirmDirect = async (id) => {
    try {
      await confirmAppointment(id);
      toast.success('Appointment confirmed');
      loadData();
    } catch { toast.error('Failed to confirm'); }
  };

  const openActionModal = (apt, action) => {
    setActionModal({
      show: true,
      aptId: apt.appointmentId,
      action,
      patientEmail: apt.patient?.email || '',
      patientName: apt.patient?.patientName || '',
    });
    setActionMessage('');
  };

  const handleActionWithEmail = async () => {
    try {
      if (actionModal.action === 'approve') {
        await handleApprove(actionModal.aptId);
      } else {
        await handleReject(actionModal.aptId);
      }
      if (actionMessage.trim() && actionModal.patientEmail) {
        await sendDoctorEmail({
          to: actionModal.patientEmail,
          subject: `Appointment ${actionModal.action === 'approve' ? 'Approved' : 'Rejected'} - Doctor App`,
          body: `Dear ${actionModal.patientName},\n\n${actionMessage}\n\nRegards,\nDr. ${doctor?.doctorName || 'Doctor'}`,
        });
        toast.success('Email sent to patient');
      }
    } catch {
      // action already handled
    }
    setActionModal({ show: false, aptId: null, action: '', patientEmail: '', patientName: '' });
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSendingEmail(true);
    try {
      await sendDoctorEmail({
        to: emailModal.to,
        subject: emailForm.subject,
        body: `Dear ${emailModal.patientName},\n\n${emailForm.body}\n\nRegards,\nDr. ${doctor?.doctorName || 'Doctor'}`,
      });
      toast.success('Email sent successfully');
      setEmailModal({ show: false, to: '', patientName: '' });
      setEmailForm({ subject: '', body: '' });
    } catch {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(
    (a) => a.appointmentDate === todayStr && ['APPROVED', 'CONFIRMED', 'PENDING'].includes(a.appointmentStatus)
  );
  const todayPatients = todayApts.length;

  // Patient summary for donut — New / Old / Total
  const confirmedPatientIds = new Set(appointments.filter(a => a.appointmentStatus === 'CONFIRMED').map(a => a.patient?.patientId));
  const allPatientIds = [...new Set(appointments.map(a => a.patient?.patientId).filter(Boolean))];
  const oldPatientsCount = confirmedPatientIds.size;
  const newPatientsCount = allPatientIds.filter(id => !confirmedPatientIds.has(id)).length;
  const patientSummary = [
    { name: 'New', value: newPatientsCount },
    { name: 'Old', value: oldPatientsCount },
    { name: 'Total', value: patients.length },
  ].filter(s => s.value > 0);

  // Upcoming appointments (all statuses, date >= today, ascending)
  const upcomingApts = appointments
    .filter(a => ['PENDING', 'APPROVED', 'CONFIRMED'].includes(a.appointmentStatus) && a.appointmentDate >= todayStr)
    .sort((a, b) => {
      const dc = (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
      return dc !== 0 ? dc : (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || '');
    });

  // Pending appointment requests
  const pendingApts = appointments
    .filter(a => a.appointmentStatus === 'PENDING')
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);

  // Review breakdown
  const reviewBreakdown = [
    { label: 'Excellent', count: feedbacks.filter(f => f.rating === 5).length, color: '#1B6EB5' },
    { label: 'Great', count: feedbacks.filter(f => f.rating === 4).length, color: '#3DB39E' },
    { label: 'Good', count: feedbacks.filter(f => f.rating === 3).length, color: '#E8A838' },
    { label: 'Average', count: feedbacks.filter(f => f.rating <= 2).length, color: '#6c9dc6' },
  ];
  const maxReview = Math.max(...reviewBreakdown.map(r => r.count), 1);

  // Next patient (next upcoming APPROVED or CONFIRMED appointment)
  const nextPatient = appointments
    .filter(a => (a.appointmentStatus === 'APPROVED' || a.appointmentStatus === 'CONFIRMED') && a.appointmentDate >= todayStr)
    .sort((a, b) => {
      const dc = (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
      return dc !== 0 ? dc : (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || '');
    })[0] || null;

  // Last visit for next patient
  const nextPatientLastVisit = nextPatient
    ? appointments
        .filter(a => a.patient?.patientId === nextPatient.patient?.patientId && a.appointmentStatus === 'CONFIRMED' && a.appointmentDate !== todayStr)
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0]
    : null;

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
      <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#1B6EB5' }} />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <h4 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>Dashboard</h4>

      {/* Stat Cards Row */}
      <div className="row g-3 mb-4" >
        {[
          { icon: 'bi-people-fill', label: 'Total Patients', value: patients.length, sub: 'Till Today' },
          { icon: 'bi-person-check-fill', label: 'Today Patients', value: todayPatients, sub: format(new Date(), 'dd MMM yyyy') },
          { icon: 'bi-calendar2-check-fill', label: 'Today Appointments', value: todayApts.length, sub: format(new Date(), 'dd MMM yyyy') },
        ].map((stat, i) => (
          <div key={i} className="col-md-4">
            <div className="card border-0 shadow-sm h-100 dashboard-stat-card" style={{ borderRadius: 12 ,background:'#e8f0fe' }}>
              <div className="card-body d-flex align-items-center p-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: 60, height: 60, minWidth: 60, border: '2px solid #1B6EB5', background: 'transparent' }}>
                  <i className={`bi ${stat.icon} fs-4`} style={{ color: '#1B6EB5' }}></i>
                </div>
                <div>
                  <div className="text-muted small">{stat.label}</div>
                  <h2 className="mb-0 fw-bold" style={{ color: '#1a1a2e' }}>{stat.value}</h2>
                  <small className="text-muted">{stat.sub}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row: Patient Summary + Today Appointments + Next Patient */}
      <div className="row g-3 mb-4">
        {/* Patient Summary Donut */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom-0 pt-3 px-4">
              <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Patient Summary</h6>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center pt-0">
              {patientSummary.length === 0 ? (
                <p className="text-muted small">No patient data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={patientSummary} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} startAngle={90} endAngle={-270}>
                      {patientSummary.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="d-flex gap-3 mt-2">
                {patientSummary.map((s, i) => (
                  <div key={i} className="d-flex align-items-center">
                    <div className="rounded-circle me-1" style={{ width: 10, height: 10, background: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                    <small className="text-muted">{s.name}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, background: '#e8f0fe' }}>
            <div className="card-header border-bottom d-flex justify-content-between align-items-center px-4 pt-3" style={{ background: 'transparent', borderColor: '#d0dce8' }}>
              <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Upcoming Appointments</h6>
              <button className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold" style={{ color: '#1B6EB5' }} onClick={() => navigate('/doctor/appointments')}>See All</button>
            </div>
            <div className="card-body p-0">
              {upcomingApts.length === 0 ? (
                <div className="text-center py-5" style={{ color: '#6b7c93' }}>
                  <i className="bi bi-calendar-x fs-2 d-block mb-2" style={{ color: '#a8c4de' }}></i>
                  <small>No upcoming appointments</small>
                </div>
              ) : (
                <div className="list-group list-group-flush" style={{ background: 'transparent' }}>
                  {upcomingApts.slice(0, 5).map((apt) => (
                    <div key={apt.appointmentId} className="list-group-item px-4 py-3 border-0 border-bottom" style={{ background: 'transparent', borderColor: '#d0dce8' }}>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: 40, height: 40, minWidth: 40, background: '#fff', overflow: 'hidden' }}>
                          {apt.patient?.profilePhoto ? (
                            <img src={apt.patient.profilePhoto} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} />
                          ) : (
                            <i className="bi bi-person-fill" style={{ color: '#1B6EB5' }}></i>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold small" style={{ color: '#1B6EB5' }}>{apt.patient?.patientName}</div>
                          <small style={{ color: '#6b7c93' }}>{apt.appointmentDate} {apt.timeSlot ? `· ${apt.timeSlot.startTime?.slice(0, 5)}` : ''}</small>
                        </div>
                        <div className="text-end">
                          <StatusBadge status={apt.appointmentStatus} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Patient Details */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, background: '#e8f0fe' }}>
            <div className="card-header border-bottom px-4 pt-3" style={{ background: 'transparent', borderColor: '#d0dce8' }}>
              <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Next Patient Details</h6>
            </div>
            <div className="card-body px-4" style={{ background: 'transparent' }}>
              {!nextPatient ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-person-x fs-2 d-block mb-2" style={{ color: '#c5d5e4' }}></i>
                  <small>No upcoming patient</small>
                </div>
              ) : (
                <>
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ width: 50, height: 50, background: '#fff', overflow: 'hidden' }}>
                      {nextPatient.patient?.profilePhoto ? (
                        <img src={nextPatient.patient.profilePhoto} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <i className="bi bi-person-fill fs-4" style={{ color: '#1B6EB5' }}></i>
                      )}
                    </div>
                    <div>
                      <div className="fw-bold" style={{ color: '#1B6EB5' }}>{nextPatient.patient?.patientName}</div>
                      <small style={{ color: '#6b7c93' }}>{nextPatient.remark || 'General Checkup'}</small>
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Age</small>
                      <span className="fw-medium small">{nextPatient.patient?.age || '-'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Gender</small>
                      <span className="fw-medium small">{nextPatient.patient?.gender || '-'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Blood Group</small>
                      <span className="fw-medium small">{nextPatient.patient?.bloodGroup || '-'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Time Slot</small>
                      <span className="fw-medium small">
                        {nextPatient.timeSlot ? `${nextPatient.timeSlot.startTime?.slice(0,5)}` : '-'}
                      </span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Mobile</small>
                      <span className="fw-medium small">{nextPatient.patient?.mobileNo || '-'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Last Visit</small>
                      <span className="fw-medium small">
                        {nextPatientLastVisit ? format(new Date(nextPatientLastVisit.appointmentDate), 'dd MMM yyyy') : 'First Visit'}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm flex-fill" style={{ background: '#1B6EB5', color: '#fff', borderRadius: 8 }}
                      onClick={() => navigate('/doctor/patients')}>
                      <i className="bi bi-file-medical me-1"></i>Full Profile
                    </button>
                    <button className="btn btn-sm flex-fill" style={{ background: '#fff', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 8 }}
                      onClick={() => {
                        setEmailModal({ show: true, to: nextPatient.patient?.email || '', patientName: nextPatient.patient?.patientName || '' });
                        setEmailForm({ subject: '', body: '' });
                      }}>
                      <i className="bi bi-envelope me-1"></i>Chat
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Reviews + Appointment Requests */}
      <div className="row g-3 mb-4">
        {/* Patient Reviews */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center px-4 pt-3">
              <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Patient Reviews</h6>
              <button className="btn btn-sm btn-link text-decoration-none p-0" style={{ color: '#1B6EB5' }}
                onClick={() => navigate('/doctor/feedbacks')}>View All</button>
            </div>
            <div className="card-body px-4">
              {feedbacks.length === 0 ? (
                <div className="text-center text-muted py-3"><small>No reviews yet</small></div>
              ) : (
                reviewBreakdown.map((r, i) => (
                  <div key={i} className="d-flex align-items-center mb-3">
                    <span className="small text-muted" style={{ width: 70 }}>{r.label}</span>
                    <div className="flex-grow-1 mx-2" style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                      <div style={{ width: `${(r.count / maxReview) * 100}%`, height: '100%', background: r.color, borderRadius: 4, transition: 'width 0.5s ease' }}></div>
                    </div>
                    <span className="small fw-medium" style={{ width: 20, textAlign: 'right', color: '#1a1a2e' }}>{r.count}</span>
                  </div>
                ))
              )}
              <div className="text-center mt-2 pt-2 border-top">
                <span className="fw-bold fs-5" style={{ color: '#1B6EB5' }}>
                  {feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '0'}
                </span>
                <span className="text-warning ms-1">★</span>
                <small className="text-muted ms-1">({feedbacks.length} reviews)</small>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Requests */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, background: '#e8f0fe' }}>
            <div className="card-header border-bottom d-flex justify-content-between align-items-center px-4 pt-3" style={{ background: 'transparent', borderColor: '#d0dce8' }}>
              <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Appointment Requests</h6>
              <button className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold" style={{ color: '#1B6EB5' }}
                onClick={() => navigate('/doctor/appointments')}>See All</button>
            </div>
            <div className="card-body p-0">
              {pendingApts.length === 0 ? (
                <div className="text-center py-4" style={{ color: '#6b7c93' }}><small>No pending requests</small></div>
              ) : (
                <div className="list-group list-group-flush" style={{ background: 'transparent' }}>
                  {pendingApts.map((apt) => (
                    <div key={apt.appointmentId} className="list-group-item px-4 py-3 border-0 border-bottom" style={{ background: 'transparent', borderColor: '#d0dce8' }}>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: 38, height: 38, minWidth: 38, background: '#fff', overflow: 'hidden' }}>
                          {apt.patient?.profilePhoto ? (
                            <img src={apt.patient.profilePhoto} alt="" style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: '50%' }} />
                          ) : (
                            <i className="bi bi-person-fill" style={{ color: '#1B6EB5', fontSize: '0.9rem' }}></i>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold small" style={{ color: '#1a1a2e' }}>{apt.patient?.patientName}</div>
                          <small style={{ color: '#6b7c93' }}>{apt.remark || 'Checkup'}</small>
                        </div>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm p-1 px-2" style={{ background: '#d4edda', color: '#198754', borderRadius: 6 }}
                            onClick={() => handleConfirmDirect(apt.appointmentId)} title="Confirm">
                            <i className="bi bi-check-lg"></i>
                          </button>
                          <button className="btn btn-sm p-1 px-2" style={{ background: '#f8d7da', color: '#dc3545', borderRadius: 6 }}
                            onClick={() => openActionModal(apt, 'reject')} title="Reject">
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom px-4 pt-3">
              <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Quick Actions</h6>
            </div>
            <div className="card-body px-4">
              {[
                { icon: 'bi-calendar-check', label: 'Appointments', desc: 'Manage bookings', path: '/doctor/appointments' },
                { icon: 'bi-people', label: 'My Patients', desc: 'View patient list', path: '/doctor/patients' },
                { icon: 'bi-clock', label: 'Availability', desc: 'Set schedule', path: '/doctor/availability' },
                { icon: 'bi-person-circle', label: 'Profile', desc: 'Edit your profile', path: '/doctor/profile' },
              ].map((action, i) => (
                <div key={i} className={`d-flex align-items-center py-2 ${i > 0 ? 'border-top' : ''}`}
                  style={{ cursor: 'pointer' }} onClick={() => navigate(action.path)}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ width: 38, height: 38, minWidth: 38, background: '#e8f0fe' }}>
                    <i className={`bi ${action.icon}`} style={{ color: '#1B6EB5' }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-medium small" style={{ color: '#1a1a2e' }}>{action.label}</div>
                    <small className="text-muted">{action.desc}</small>
                  </div>
                  <i className="bi bi-chevron-right text-muted small"></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Email Chat Modal */}
      <Modal show={emailModal.show} onHide={() => setEmailModal({ show: false, to: '', patientName: '' })} centered>
        <Modal.Header closeButton style={{ background: '#e8f0fe', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: '#1B6EB5', fontSize: '1.1rem' }}>
            <i className="bi bi-envelope me-2"></i>Send Email to {emailModal.patientName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>To</label>
            <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={emailModal.to} disabled />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Subject *</label>
            <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} placeholder="Enter subject"
              value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Message *</label>
            <textarea className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} rows={4} placeholder="Type your message..."
              value={emailForm.body} onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEmailModal({ show: false, to: '', patientName: '' })}>Cancel</Button>
          <Button style={{ background: '#1B6EB5', border: 'none' }} onClick={handleSendEmail} disabled={sendingEmail}>
            {sendingEmail ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-1"></i>}
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Approve/Reject with Message Modal */}
      <Modal show={actionModal.show} onHide={() => setActionModal({ show: false, aptId: null, action: '', patientEmail: '', patientName: '' })} centered>
        <Modal.Header closeButton style={{ background: actionModal.action === 'approve' ? '#d4edda' : '#f8d7da', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: actionModal.action === 'approve' ? '#198754' : '#dc3545', fontSize: '1.1rem' }}>
            <i className={`bi ${actionModal.action === 'approve' ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
            {actionModal.action === 'approve' ? 'Approve' : 'Reject'} Appointment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ color: '#1a1a2e' }}>
            {actionModal.action === 'approve' ? 'Approve' : 'Reject'} appointment for <strong>{actionModal.patientName}</strong>?
          </p>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>
              Message to patient (optional — sent via email)
            </label>
            <textarea className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} rows={3}
              placeholder="Add a message for the patient..."
              value={actionMessage} onChange={(e) => setActionMessage(e.target.value)} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setActionModal({ show: false, aptId: null, action: '', patientEmail: '', patientName: '' })}>Cancel</Button>
          <Button
            style={{ background: actionModal.action === 'approve' ? '#198754' : '#dc3545', border: 'none' }}
            onClick={handleActionWithEmail}>
            <i className={`bi ${actionModal.action === 'approve' ? 'bi-check-lg' : 'bi-x-lg'} me-1`}></i>
            {actionModal.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
