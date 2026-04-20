import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllAppointments, cancelAppointment, addFeedback, getMedicinesByAppointment, getFeedbackByAppointment } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { format, isAfter, isToday, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { Modal, Button, OverlayTrigger, Tooltip, ProgressBar } from 'react-bootstrap';

const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'CANCELLED', 'REJECTED'];
const STATUS_ICONS = { ALL: 'bi-grid', PENDING: 'bi-hourglass-split', APPROVED: 'bi-check2-circle', CONFIRMED: 'bi-patch-check', CANCELLED: 'bi-x-octagon', REJECTED: 'bi-slash-circle' };
const STATUS_COLORS = { ALL: 'primary', PENDING: 'warning', APPROVED: 'info', CONFIRMED: 'success', CANCELLED: 'secondary', REJECTED: 'danger' };
const PAGE_SIZE = 6;

export default function PatientAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModal, setCancelModal] = useState({ show: false, id: null, doctorName: '' });
  const [feedbackModal, setFeedbackModal] = useState({ show: false, apt: null });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, feedbackComment: '' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [prescModal, setPrescModal] = useState({ show: false, medicines: [], doctorName: '', date: '' });
  const [prescLoading, setPrescLoading] = useState(false);
  const [detailModal, setDetailModal] = useState({ show: false, apt: null });
  const [feedbackGiven, setFeedbackGiven] = useState({});

  useEffect(() => { loadAppointments(); }, []);
  useEffect(() => { setCurrentPage(1); }, [filter, searchTerm, sortOrder]);

  const loadAppointments = async () => {
    try {
      const res = await getAllAppointments();
      const all = res.data.data || [];
      const myApts = all.filter((a) => a.patient?.patientId === user.profileId);
      setAppointments(myApts);

      // Check which appointments already have feedback
      const fbStatus = {};
      await Promise.all(
        myApts
          .filter((a) => a.appointmentStatus === 'CONFIRMED')
          .map(async (a) => {
            try {
              const fbRes = await getFeedbackByAppointment(a.appointmentId);
              fbStatus[a.appointmentId] = fbRes.data.data != null;
            } catch {
              fbStatus[a.appointmentId] = false;
            }
          })
      );
      setFeedbackGiven(fbStatus);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const s = { total: appointments.length, PENDING: 0, APPROVED: 0, CONFIRMED: 0, CANCELLED: 0, REJECTED: 0, upcoming: 0 };
    const now = new Date();
    appointments.forEach((a) => {
      if (s[a.appointmentStatus] !== undefined) s[a.appointmentStatus]++;
      if (['PENDING', 'APPROVED', 'CONFIRMED'].includes(a.appointmentStatus) && a.appointmentDate) {
        const d = parseISO(a.appointmentDate);
        if (isAfter(d, now) || isToday(d)) s.upcoming++;
      }
    });
    return s;
  }, [appointments]);

  // Next upcoming appointment
  const nextAppointment = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => ['PENDING', 'APPROVED', 'CONFIRMED'].includes(a.appointmentStatus) && a.appointmentDate)
      .filter((a) => { const d = parseISO(a.appointmentDate); return isAfter(d, now) || isToday(d); })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0] || null;
  }, [appointments]);

  // Filter + search + sort
  const processed = useMemo(() => {
    let list = filter === 'ALL' ? [...appointments] : appointments.filter((a) => a.appointmentStatus === filter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((a) =>
        a.doctor?.doctorName?.toLowerCase().includes(q) ||
        a.doctor?.speciality?.toLowerCase().includes(q) ||
        a.remark?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const da = new Date(a.appointmentDate || 0);
      const db = new Date(b.appointmentDate || 0);
      return sortOrder === 'desc' ? db - da : da - db;
    });
    return list;
  }, [appointments, filter, searchTerm, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paginated = processed.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCancel = async () => {
    const { id } = cancelModal;
    setCancellingId(id);
    try {
      await cancelAppointment(id);
      toast.success('Appointment cancelled');
      setCancelModal({ show: false, id: null, doctorName: '' });
      loadAppointments();
    } catch {
      toast.error('Failed to cancel');
    } finally {
      setCancellingId(null);
    }
  };

  const handleFeedback = async () => {
    if (!feedbackForm.feedbackComment.trim()) {
      toast.error('Please add a comment');
      return;
    }
    setFeedbackSubmitting(true);
    try {
      await addFeedback({
        patient: { patientId: user.profileId },
        doctor: { doctorId: feedbackModal.apt.doctor?.doctorId },
        appointment: { appointmentId: feedbackModal.apt.appointmentId },
        rating: feedbackForm.rating,
        feedbackComment: feedbackForm.feedbackComment,
      });
      toast.success('Feedback submitted!');
      setFeedbackGiven((prev) => ({ ...prev, [feedbackModal.apt.appointmentId]: true }));
      setFeedbackModal({ show: false, apt: null });
      setFeedbackForm({ rating: 5, feedbackComment: '' });
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Feedback already submitted for this appointment');
        setFeedbackGiven((prev) => ({ ...prev, [feedbackModal.apt.appointmentId]: true }));
        setFeedbackModal({ show: false, apt: null });
      } else {
        toast.error('Failed to submit feedback');
      }
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const viewPrescription = async (apt) => {
    setPrescLoading(true);
    setPrescModal({ show: true, medicines: [], doctorName: apt.doctor?.doctorName || '', date: apt.appointmentDate || '' });
    try {
      const res = await getMedicinesByAppointment(apt.appointmentId);
      setPrescModal((p) => ({ ...p, medicines: res.data.data || [] }));
    } catch {
      toast.error('Failed to load prescription');
    } finally {
      setPrescLoading(false);
    }
  };

  const getTimeUntil = (dateStr) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
    if (diff === 1) return 'Tomorrow';
    if (diff <= 7) return `In ${diff} days`;
    return format(d, 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: 400 }}>
        <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }} />
        <p className="text-muted">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">
            <i className="bi bi-calendar2-check me-2 text-info"></i>My Appointments
          </h4>
          <p className="text-muted mb-0 small">Track and manage all your medical appointments</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-info btn-sm text-white" onClick={() => navigate('/patient/book')}>
            <i className="bi bi-plus-circle me-1"></i>Book Appointment
          </button>
          <button className="btn btn-outline-info btn-sm" onClick={() => { setLoading(true); loadAppointments(); }}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total', value: stats.total, icon: 'bi-calendar3', color: 'primary' },
          { label: 'Upcoming', value: stats.upcoming, icon: 'bi-clock-history', color: 'info' },
          { label: 'Confirmed', value: stats.CONFIRMED, icon: 'bi-patch-check-fill', color: 'success' },
          { label: 'Pending', value: stats.PENDING, icon: 'bi-hourglass-split', color: 'warning' },
          { label: 'Cancelled', value: stats.CANCELLED, icon: 'bi-x-circle-fill', color: 'secondary' },
        ].map((s) => (
          <div className="col-6 col-md" key={s.label}>
            <div className={`card border-0 shadow-sm h-100`} style={{ borderLeft: `4px solid var(--bs-${s.color})`, borderLeftStyle: 'solid' }}>
              <div className="card-body py-3 px-3">
                <div className="d-flex align-items-center">
                  <div className={`rounded-3 bg-${s.color} bg-opacity-10 d-flex align-items-center justify-content-center me-3`}
                       style={{ width: 42, height: 42, minWidth: 42 }}>
                    <i className={`bi ${s.icon} text-${s.color}`}></i>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{s.value}</h5>
                    <small className="text-muted">{s.label}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Upcoming Appointment Banner */}
      {nextAppointment && (
        <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)' }}>
          <div className="card-body py-3">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm"
                   style={{ width: 48, height: 48, minWidth: 48 }}>
                <i className="bi bi-bell-fill text-info fs-5"></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="fw-semibold">Next Appointment</span>
                  <span className="badge bg-info text-white">{getTimeUntil(nextAppointment.appointmentDate)}</span>
                </div>
                <div className="text-muted small">
                  <i className="bi bi-person me-1"></i>Dr. {nextAppointment.doctor?.doctorName}
                  <span className="mx-2">|</span>
                  <i className="bi bi-calendar3 me-1"></i>{format(parseISO(nextAppointment.appointmentDate), 'EEEE, MMM dd, yyyy')}
                  {nextAppointment.timeSlot && (
                    <>
                      <span className="mx-2">|</span>
                      <i className="bi bi-clock me-1"></i>{nextAppointment.timeSlot.startTime?.slice(0,5)} - {nextAppointment.timeSlot.endTime?.slice(0,5)}
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={nextAppointment.appointmentStatus} />
            </div>
          </div>
        </div>
      )}

      {/* Search, Sort & Filter Bar */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by doctor, speciality, or remark..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-transparent"><i className="bi bi-sort-down text-muted"></i></span>
                <select className="form-select form-select-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <small className="text-muted">{processed.length} appointment{processed.length !== 1 ? 's' : ''} found</small>
            </div>
          </div>
          <div className="d-flex gap-2 mt-3 flex-wrap">
            {STATUSES.map((s) => {
              const count = s === 'ALL' ? appointments.length : stats[s] || 0;
              return (
                <button
                  key={s}
                  className={`btn btn-sm position-relative ${filter === s ? `btn-${STATUS_COLORS[s]} text-white` : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(s)}
                >
                  <i className={`bi ${STATUS_ICONS[s]} me-1`}></i>{s}
                  <span className={`badge rounded-pill ms-1 ${filter === s ? 'bg-white text-dark' : `bg-${STATUS_COLORS[s]} bg-opacity-10 text-${STATUS_COLORS[s]}`}`}
                        style={{ fontSize: '0.65rem' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      {processed.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-3">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                <i className="bi bi-calendar-x fs-1 text-muted"></i>
              </div>
            </div>
            <h5 className="text-muted fw-semibold">No appointments found</h5>
            <p className="text-muted small mb-0">
              {searchTerm ? 'Try adjusting your search terms' : filter !== 'ALL' ? `No ${filter.toLowerCase()} appointments` : 'You haven\'t booked any appointments yet'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th className="text-muted small fw-semibold" style={{ width: 40 }}>#</th>
                    <th className="text-muted small fw-semibold">Doctor</th>
                    <th className="text-muted small fw-semibold">Date & Time</th>
                    <th className="text-muted small fw-semibold">Status</th>
                    <th className="text-muted small fw-semibold">Remark</th>
                    <th className="text-muted small fw-semibold text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((apt, idx) => {
                    const aptDate = apt.appointmentDate ? parseISO(apt.appointmentDate) : null;
                    const isUpcoming = aptDate && (isAfter(aptDate, new Date()) || isToday(aptDate)) && ['PENDING', 'APPROVED', 'CONFIRMED'].includes(apt.appointmentStatus);
                    return (
                      <tr key={apt.appointmentId} style={isUpcoming ? { borderLeft: '3px solid #0dcaf0' } : {}}>
                        <td className="text-muted">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center me-2"
                                 style={{ width: 36, height: 36, minWidth: 36 }}>
                              <i className="bi bi-person-circle text-info"></i>
                            </div>
                            <div>
                              <div className="fw-medium">{apt.doctor?.doctorName}</div>
                              <span className="badge bg-light text-dark small" style={{ fontSize: '0.7rem' }}>
                                <i className="bi bi-heart-pulse me-1"></i>{apt.doctor?.speciality}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium small">
                              <i className="bi bi-calendar3 me-1 text-muted"></i>
                              {aptDate ? format(aptDate, 'EEE, MMM dd, yyyy') : '-'}
                            </div>
                            <div className="text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              {apt.timeSlot ? `${apt.timeSlot.startTime?.slice(0,5)} - ${apt.timeSlot.endTime?.slice(0,5)}` : '-'}
                            </div>
                            {isUpcoming && aptDate && isToday(aptDate) && (
                              <span className="badge bg-info bg-opacity-10 text-info mt-1" style={{ fontSize: '0.65rem' }}>
                                <i className="bi bi-lightning-fill me-1"></i>Today
                              </span>
                            )}
                          </div>
                        </td>
                        <td><StatusBadge status={apt.appointmentStatus} /></td>
                        <td>
                          <span className="text-muted small" style={{ maxWidth: 150, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={apt.remark || ''}>
                            {apt.remark || '-'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-end flex-wrap">
                            <OverlayTrigger placement="top" overlay={<Tooltip>View Details</Tooltip>}>
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => setDetailModal({ show: true, apt })}>
                                <i className="bi bi-eye"></i>
                              </button>
                            </OverlayTrigger>
                            {['PENDING', 'APPROVED'].includes(apt.appointmentStatus) && (
                              <OverlayTrigger placement="top" overlay={<Tooltip>Cancel Appointment</Tooltip>}>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  disabled={cancellingId === apt.appointmentId}
                                  onClick={() => setCancelModal({ show: true, id: apt.appointmentId, doctorName: apt.doctor?.doctorName || '' })}
                                >
                                  {cancellingId === apt.appointmentId ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-x-circle"></i>}
                                </button>
                              </OverlayTrigger>
                            )}
                            {apt.appointmentStatus === 'CONFIRMED' && (() => {
                              const now = new Date();
                              const endTime = apt.timeSlot?.endTime;
                              let aptDone = aptDate && aptDate < new Date(now.toDateString());
                              if (!aptDone && aptDate && isToday(aptDate) && endTime) {
                                const [h, m] = endTime.split(':').map(Number);
                                aptDone = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
                              }
                              return aptDone;
                            })() && (
                              feedbackGiven[apt.appointmentId] ? (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Feedback Submitted</Tooltip>}>
                                  <button className="btn btn-sm btn-success" disabled>
                                    <i className="bi bi-check-circle"></i>
                                  </button>
                                </OverlayTrigger>
                              ) : (
                                <OverlayTrigger placement="top" overlay={<Tooltip>Give Feedback</Tooltip>}>
                                  <button className="btn btn-sm btn-info text-white" onClick={() => setFeedbackModal({ show: true, apt })}>
                                    <i className="bi bi-chat-dots"></i>
                                  </button>
                                </OverlayTrigger>
                              )
                            )}
                            <OverlayTrigger placement="top" overlay={<Tooltip>View Prescription</Tooltip>}>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => viewPrescription(apt)}>
                                <i className="bi bi-capsule"></i>
                              </button>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, processed.length)} of {processed.length}
              </small>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <li key={`e${i}`} className="page-item disabled"><span className="page-link">…</span></li>
                      ) : (
                        <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
                        </li>
                      )
                    )}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Appointment Detail Modal */}
      <Modal show={detailModal.show} onHide={() => setDetailModal({ show: false, apt: null })} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5"><i className="bi bi-info-circle me-2 text-info"></i>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailModal.apt && (() => {
            const a = detailModal.apt;
            return (
              <div>
                <div className="text-center mb-4">
                  <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2"
                       style={{ width: 64, height: 64 }}>
                    <i className="bi bi-person-circle text-info fs-3"></i>
                  </div>
                  <h5 className="mb-0">Dr. {a.doctor?.doctorName}</h5>
                  <span className="badge bg-light text-dark"><i className="bi bi-heart-pulse me-1"></i>{a.doctor?.speciality}</span>
                </div>
                <div className="list-group list-group-flush">
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted"><i className="bi bi-hash me-2"></i>Appointment ID</span>
                    <span className="fw-medium">#{a.appointmentId}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted"><i className="bi bi-calendar3 me-2"></i>Date</span>
                    <span className="fw-medium">{a.appointmentDate ? format(parseISO(a.appointmentDate), 'EEEE, MMM dd, yyyy') : '-'}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted"><i className="bi bi-clock me-2"></i>Time</span>
                    <span className="fw-medium">{a.timeSlot ? `${a.timeSlot.startTime?.slice(0,5)} - ${a.timeSlot.endTime?.slice(0,5)}` : '-'}</span>
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted"><i className="bi bi-flag me-2"></i>Status</span>
                    <StatusBadge status={a.appointmentStatus} />
                  </div>
                  <div className="list-group-item d-flex justify-content-between px-0">
                    <span className="text-muted"><i className="bi bi-chat-left-text me-2"></i>Remark</span>
                    <span className="fw-medium text-end" style={{ maxWidth: '60%' }}>{a.remark || '-'}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          {detailModal.apt && detailModal.apt.appointmentStatus === 'CONFIRMED' && (() => {
            const dAptDate = detailModal.apt.appointmentDate ? parseISO(detailModal.apt.appointmentDate) : null;
            const now = new Date();
            const endTime = detailModal.apt.timeSlot?.endTime;
            let aptDone = dAptDate && dAptDate < new Date(now.toDateString());
            if (!aptDone && dAptDate && isToday(dAptDate) && endTime) {
              const [h, m] = endTime.split(':').map(Number);
              aptDone = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
            }
            return aptDone;
          })() && !feedbackGiven[detailModal.apt.appointmentId] && (
            <Button variant="info" className="text-white" size="sm"
                    onClick={() => { setDetailModal({ show: false, apt: null }); setFeedbackModal({ show: true, apt: detailModal.apt }); }}>
              <i className="bi bi-chat-dots me-1"></i>Feedback
            </Button>
          )}
          {detailModal.apt && feedbackGiven[detailModal.apt.appointmentId] && (
            <Button variant="success" size="sm" disabled>
              <i className="bi bi-check-circle me-1"></i>Feedback Given
            </Button>
          )}
          <Button variant="outline-primary" size="sm"
                  onClick={() => { viewPrescription(detailModal.apt); setDetailModal({ show: false, apt: null }); }}>
            <i className="bi bi-capsule me-1"></i>Prescription
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setDetailModal({ show: false, apt: null })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal show={cancelModal.show} onHide={() => setCancelModal({ show: false, id: null, doctorName: '' })} centered size="sm">
        <Modal.Body className="text-center py-4">
          <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
               style={{ width: 64, height: 64 }}>
            <i className="bi bi-exclamation-triangle text-danger fs-3"></i>
          </div>
          <h5 className="fw-bold">Cancel Appointment?</h5>
          <p className="text-muted small mb-0">
            Are you sure you want to cancel your appointment with <strong>Dr. {cancelModal.doctorName}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setCancelModal({ show: false, id: null, doctorName: '' })}>
            Keep It
          </Button>
          <Button variant="danger" size="sm" onClick={handleCancel} disabled={cancellingId !== null}>
            {cancellingId ? <><span className="spinner-border spinner-border-sm me-1" />Cancelling...</> : <><i className="bi bi-x-circle me-1"></i>Yes, Cancel</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Feedback Modal */}
      <Modal show={feedbackModal.show} onHide={() => setFeedbackModal({ show: false, apt: null })} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5"><i className="bi bi-chat-heart me-2 text-info"></i>Share Your Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <div className="rounded-circle bg-info bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-2"
                 style={{ width: 56, height: 56 }}>
              <i className="bi bi-person-circle text-info fs-4"></i>
            </div>
            <div className="fw-medium">Dr. {feedbackModal.apt?.doctor?.doctorName}</div>
            <small className="text-muted">{feedbackModal.apt?.doctor?.speciality}</small>
          </div>
          <div className="mb-4 text-center">
            <label className="form-label small text-muted">How was your experience?</label>
            <div className="d-flex justify-content-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`bi fs-3 ${star <= feedbackForm.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                  style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.2)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                ></i>
              ))}
            </div>
            <small className="text-muted">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][feedbackForm.rating]}</small>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-medium">Your Comment</label>
            <textarea
              className="form-control"
              rows="3"
              value={feedbackForm.feedbackComment}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackComment: e.target.value })}
              placeholder="Tell us about your experience with the doctor..."
              maxLength={500}
            />
            <div className="text-end mt-1">
              <small className="text-muted">{feedbackForm.feedbackComment.length}/500</small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setFeedbackModal({ show: false, apt: null })}>Cancel</Button>
          <Button variant="info" className="text-white" size="sm" onClick={handleFeedback} disabled={feedbackSubmitting}>
            {feedbackSubmitting ? <><span className="spinner-border spinner-border-sm me-1" />Submitting...</> : <><i className="bi bi-send me-1"></i>Submit Feedback</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Prescription Modal */}
      <Modal show={prescModal.show} onHide={() => setPrescModal({ show: false, medicines: [], doctorName: '', date: '' })} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
          <Modal.Title className="fs-5"><i className="bi bi-file-earmark-medical me-2 text-primary"></i>Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                 style={{ width: 48, height: 48, minWidth: 48 }}>
              <i className="bi bi-person-circle text-primary fs-5"></i>
            </div>
            <div>
              <div className="fw-medium">Dr. {prescModal.doctorName}</div>
              {prescModal.date && <small className="text-muted"><i className="bi bi-calendar3 me-1"></i>{format(parseISO(prescModal.date), 'MMM dd, yyyy')}</small>}
            </div>
          </div>
          {prescLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary spinner-border-sm" />
              <p className="text-muted small mt-2">Loading prescription...</p>
            </div>
          ) : prescModal.medicines.length === 0 ? (
            <div className="text-center py-4">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-2"
                   style={{ width: 64, height: 64 }}>
                <i className="bi bi-journal-x fs-3 text-muted"></i>
              </div>
              <p className="text-muted mb-0">No medicines prescribed yet</p>
            </div>
          ) : (
            <div>
              <div className="row g-3">
                {prescModal.medicines.map((m, i) => (
                  <div className="col-md-6" key={m.medicineId || i}>
                    <div className="card border h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-start gap-2">
                          <div className="rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center mt-1"
                               style={{ width: 32, height: 32, minWidth: 32 }}>
                            <i className="bi bi-capsule text-primary small"></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{m.medicineName}</div>
                            <div className="d-flex flex-wrap gap-2 mt-1">
                              {m.dosage && <span className="badge bg-light text-dark"><i className="bi bi-droplet me-1"></i>{m.dosage}</span>}
                              {m.frequency && <span className="badge bg-light text-dark"><i className="bi bi-arrow-repeat me-1"></i>{m.frequency}</span>}
                              {m.duration && <span className="badge bg-light text-dark"><i className="bi bi-calendar-range me-1"></i>{m.duration}</span>}
                            </div>
                            {m.notes && <div className="text-muted small mt-2"><i className="bi bi-sticky me-1"></i>{m.notes}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-top text-muted small text-center">
                <i className="bi bi-info-circle me-1"></i>{prescModal.medicines.length} medicine{prescModal.medicines.length !== 1 ? 's' : ''} prescribed
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" size="sm" onClick={() => setPrescModal({ show: false, medicines: [], doctorName: '', date: '' })}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
