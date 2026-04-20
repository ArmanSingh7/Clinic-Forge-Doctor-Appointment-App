import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAppointmentsByDoctor, confirmAppointment, cancelAppointment, addMedicines, getMedicinesByAppointment, getPatientHistory } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { format, isToday, isTomorrow, isThisWeek, isThisMonth } from 'date-fns';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-bootstrap';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const [prescModal, setPrescModal] = useState({ show: false, apt: null });
  const [medicines, setMedicines] = useState([{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const [existingMeds, setExistingMeds] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [detailModal, setDetailModal] = useState({ show: false, apt: null });
  const [historyModal, setHistoryModal] = useState({ show: false, data: null, loading: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getAppointmentsByDoctor(user.profileId);
      setAppointments(res.data.data || []);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const handleConfirm = async (id) => {
    try { await confirmAppointment(id); toast.success('Appointment confirmed'); load(); }
    catch { toast.error('Failed to confirm'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await cancelAppointment(id); toast.success('Appointment cancelled'); load(); }
    catch { toast.error('Failed to cancel'); }
  };

  const openPrescribe = async (apt) => {
    setPrescModal({ show: true, apt });
    setViewMode(false);
    setMedicines([{ medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }]);
    try {
      const res = await getMedicinesByAppointment(apt.appointmentId);
      const meds = res.data.data || [];
      setExistingMeds(meds);
      if (meds.length > 0) setViewMode(true);
    } catch { setExistingMeds([]); }
  };

  const addMedicineRow = () => setMedicines([...medicines, { medicineName: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const removeMedicineRow = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicineRow = (i, field, val) => {
    const updated = [...medicines];
    updated[i] = { ...updated[i], [field]: val };
    setMedicines(updated);
  };

  const handleSavePrescription = async () => {
    const valid = medicines.filter(m => m.medicineName.trim());
    if (valid.length === 0) { toast.error('Add at least one medicine'); return; }
    try {
      await addMedicines(prescModal.apt.appointmentId, valid);
      toast.success('Prescription saved!');
      setPrescModal({ show: false, apt: null });
    } catch { toast.error('Failed to save prescription'); }
  };

  const viewHistory = async (patient) => {
    setHistoryModal({ show: true, data: null, loading: true });
    try {
      const res = await getPatientHistory(patient.patientId, user.profileId);
      setHistoryModal({ show: true, data: res.data.data, loading: false });
    } catch {
      toast.error('Failed to load history');
      setHistoryModal({ show: false, data: null, loading: false });
    }
  };

  // Period filtering
  const filterByPeriod = (list) => list.filter(a => {
    if (!a.appointmentDate) return false;
    const d = new Date(a.appointmentDate + 'T00:00:00');
    switch (period) {
      case 'TODAY': return isToday(d);
      case 'TOMORROW': return isTomorrow(d);
      case 'THIS_WEEK': return isThisWeek(d, { weekStartsOn: 1 });
      case 'THIS_MONTH': return isThisMonth(d);
      case 'ALL': return true;
      default: return true;
    }
  });

  const filterByStatus = (list) => {
    if (statusFilter === 'ACTIVE') return list.filter(a => ['PENDING', 'APPROVED', 'CONFIRMED'].includes(a.appointmentStatus));
    if (statusFilter === 'ALL') return list;
    return list.filter(a => a.appointmentStatus === statusFilter);
  };

  const filtered = filterByStatus(filterByPeriod(appointments))
    .sort((a, b) => {
      const dc = (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
      return dc !== 0 ? dc : (a.timeSlot?.startTime || '').localeCompare(b.timeSlot?.startTime || '');
    });

  const groupedByDate = filtered.reduce((acc, apt) => {
    const date = apt.appointmentDate || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedByDate).sort();

  const getDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (isToday(d)) return 'Today — ' + format(d, 'EEEE, MMM dd, yyyy');
    if (isTomorrow(d)) return 'Tomorrow — ' + format(d, 'EEEE, MMM dd, yyyy');
    return format(d, 'EEEE, MMM dd, yyyy');
  };

  const statusColor = (s) => ({
    CONFIRMED: '#198754', APPROVED: '#1B6EB5', PENDING: '#E8A838',
    CANCELLED: '#dc3545', REJECTED: '#dc3545'
  }[s] || '#6b7c93');

  const statusFiltered = filterByStatus(appointments);
  const todayCount = statusFiltered.filter(a => a.appointmentDate && isToday(new Date(a.appointmentDate + 'T00:00:00'))).length;
  const tomorrowCount = statusFiltered.filter(a => a.appointmentDate && isTomorrow(new Date(a.appointmentDate + 'T00:00:00'))).length;
  const weekCount = statusFiltered.filter(a => a.appointmentDate && isThisWeek(new Date(a.appointmentDate + 'T00:00:00'), { weekStartsOn: 1 })).length;
  const monthCount = statusFiltered.filter(a => a.appointmentDate && isThisMonth(new Date(a.appointmentDate + 'T00:00:00'))).length;

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1B6EB5' }} /></div>;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>
          <span className="d-inline-flex align-items-center justify-content-center me-2" style={{ width: 38, height: 38, borderRadius: '50%', background: '#e8f0fe' }}>
            <i className="bi bi-calendar-check" style={{ color: '#1B6EB5', fontSize: '1rem' }}></i>
          </span>
          Appointments Schedule
        </h4>
        <span className="badge px-3 py-2 fw-semibold" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 20 }}>
          {filtered.length} showing / {appointments.length} total
        </span>
      </div>

      {/* Period + Status Filters */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body p-3">
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <span className="fw-medium me-2" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>
              <i className="bi bi-calendar3 me-1"></i>View:
            </span>
            {[
              { key: 'TODAY', label: 'Today', count: todayCount, icon: 'bi-sun' },
              { key: 'TOMORROW', label: 'Tomorrow', count: tomorrowCount, icon: 'bi-sunrise' },
              { key: 'THIS_WEEK', label: 'This Week', count: weekCount, icon: 'bi-calendar-week' },
              { key: 'THIS_MONTH', label: 'This Month', count: monthCount, icon: 'bi-calendar-month' },
              { key: 'ALL', label: 'All', count: statusFiltered.length, icon: 'bi-calendar-range' },
            ].map((p) => (
              <button key={p.key} className="btn btn-sm fw-medium"
                style={period === p.key
                  ? { background: '#1B6EB5', color: '#fff', border: '1px solid #1B6EB5', borderRadius: 20 }
                  : { background: '#fff', color: '#6b7c93', border: '1px solid #e0e6ed', borderRadius: 20 }}
                onClick={() => setPeriod(p.key)}>
                <i className={`bi ${p.icon} me-1`}></i>{p.label} ({p.count})
              </button>
            ))}
          </div>
          <div className="d-flex gap-2 mt-3 flex-wrap align-items-center">
            <span className="fw-medium me-2" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>
              <i className="bi bi-funnel me-1"></i>Status:
            </span>
            {['ACTIVE', 'ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'CANCELLED'].map((s) => (
              <button key={s} className="btn btn-sm fw-medium"
                style={statusFilter === s
                  ? { background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 20, fontSize: '0.8rem' }
                  : { background: '#f8f9fa', color: '#6b7c93', border: '1px solid #e0e6ed', borderRadius: 20, fontSize: '0.8rem' }}
                onClick={() => setStatusFilter(s)}>
                {s === 'ACTIVE' ? 'Active' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Timeline */}
      {sortedDates.length === 0 ? (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          <div className="card-body text-center py-5" style={{ color: '#6b7c93' }}>
            <i className="bi bi-calendar-x fs-1 d-block mb-2" style={{ color: '#c5d5e4' }}></i>
            <p className="mb-0">No appointments found for this period</p>
          </div>
        </div>
      ) : (
        sortedDates.map((dateStr) => (
          <div key={dateStr} className="mb-4">
            {/* Date Header */}
            <div className="d-flex align-items-center mb-3">
              <div className="d-flex align-items-center justify-content-center me-3"
                style={{ width: 44, height: 44, borderRadius: 12, background: isToday(new Date(dateStr + 'T00:00:00')) ? '#1B6EB5' : '#e8f0fe' }}>
                <span className="fw-bold" style={{ color: isToday(new Date(dateStr + 'T00:00:00')) ? '#fff' : '#1B6EB5', fontSize: '0.9rem' }}>
                  {format(new Date(dateStr + 'T00:00:00'), 'dd')}
                </span>
              </div>
              <div>
                <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>{getDateLabel(dateStr)}</h6>
                <small style={{ color: '#6b7c93' }}>{groupedByDate[dateStr].length} appointment(s)</small>
              </div>
            </div>

            {/* Timeline */}
            <div className="ps-4" style={{ borderLeft: '2px solid #e8f0fe', marginLeft: 21 }}>
              {groupedByDate[dateStr].map((apt) => (
                <div key={apt.appointmentId} className="d-flex mb-3 position-relative">
                  <div className="position-absolute" style={{ left: -29, top: 14, width: 12, height: 12, borderRadius: '50%', background: statusColor(apt.appointmentStatus), border: '2px solid #fff' }}></div>

                  <div className="text-center me-3" style={{ minWidth: 70 }}>
                    <div className="fw-bold" style={{ color: '#1B6EB5', fontSize: '0.95rem' }}>
                      {apt.timeSlot?.startTime?.substring(0, 5) || '--:--'}
                    </div>
                    <small style={{ color: '#6b7c93', fontSize: '0.7rem' }}>
                      {apt.timeSlot?.endTime?.substring(0, 5) || ''}
                    </small>
                  </div>

                  <div className="card border-0 shadow-sm flex-grow-1" style={{ borderRadius: 12, borderLeft: `4px solid ${statusColor(apt.appointmentStatus)}` }}>
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center mb-2">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: 44, height: 44, minWidth: 44, background: '#e8f0fe', border: '2px solid #1B6EB5', overflow: 'hidden' }}>
                          {apt.patient?.profilePhoto ? (
                            <img src={apt.patient.profilePhoto} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%' }} />
                          ) : (
                            <i className="bi bi-person-fill fs-5" style={{ color: '#1B6EB5' }}></i>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-0" style={{ color: '#1B6EB5', fontSize: '0.95rem' }}>{apt.patient?.patientName || 'Unknown'}</h6>
                          <small style={{ color: '#6b7c93' }}>{apt.patient?.email}</small>
                        </div>
                        <StatusBadge status={apt.appointmentStatus} />
                      </div>

                      <div className="d-flex gap-3 mb-2 flex-wrap">
                        <small style={{ color: '#6b7c93' }}><i className="bi bi-chat-text me-1" style={{ color: '#1B6EB5' }}></i>{apt.remark || 'General Checkup'}</small>
                        <small style={{ color: '#6b7c93' }}><i className="bi bi-phone me-1" style={{ color: '#1B6EB5' }}></i>{apt.patient?.mobileNo || '-'}</small>
                        {apt.patient?.age && <small style={{ color: '#6b7c93' }}><i className="bi bi-person me-1" style={{ color: '#1B6EB5' }}></i>Age: {apt.patient.age}</small>}
                      </div>

                      <div className="d-flex gap-2 flex-wrap">
                        <button className="btn btn-sm" style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 8, fontSize: '0.78rem' }}
                          onClick={() => setDetailModal({ show: true, apt })}>
                          <i className="bi bi-eye me-1"></i>Details
                        </button>
                        <button className="btn btn-sm" style={{ background: '#fff', color: '#6b7c93', border: '1px solid #e0e6ed', borderRadius: 8, fontSize: '0.78rem' }}
                          onClick={() => apt.patient && viewHistory(apt.patient)}>
                          <i className="bi bi-clock-history me-1"></i>History
                        </button>
                        {apt.appointmentStatus === 'APPROVED' && (
                          <button className="btn btn-sm" style={{ background: '#d4edda', color: '#198754', borderRadius: 8, fontSize: '0.78rem' }}
                            onClick={() => handleConfirm(apt.appointmentId)}>
                            <i className="bi bi-check-lg me-1"></i>Confirm
                          </button>
                        )}
                        {['PENDING', 'APPROVED'].includes(apt.appointmentStatus) && (
                          <button className="btn btn-sm" style={{ background: '#f8d7da', color: '#dc3545', borderRadius: 8, fontSize: '0.78rem' }}
                            onClick={() => handleCancel(apt.appointmentId)}>
                            <i className="bi bi-x-lg me-1"></i>Cancel
                          </button>
                        )}
                        {['CONFIRMED', 'APPROVED'].includes(apt.appointmentStatus) && (
                          <button className="btn btn-sm" style={{ background: '#1B6EB5', color: '#fff', borderRadius: 8, fontSize: '0.78rem' }}
                            onClick={() => openPrescribe(apt)}>
                            <i className="bi bi-capsule me-1"></i>Prescribe
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Patient Detail Modal */}
      <Modal show={detailModal.show} onHide={() => setDetailModal({ show: false, apt: null })} centered>
        <Modal.Header closeButton style={{ background: '#e8f0fe', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: '#1B6EB5', fontSize: '1.1rem' }}>
            <i className="bi bi-person-vcard me-2"></i>Patient Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailModal.apt && (() => {
            const p = detailModal.apt.patient;
            const a = detailModal.apt;
            return (
              <>
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                    style={{ width: 80, height: 80, background: '#e8f0fe', border: '3px solid #1B6EB5', overflow: 'hidden' }}>
                    {p?.profilePhoto ? <img src={p.profilePhoto} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />
                      : <i className="bi bi-person-fill fs-1" style={{ color: '#1B6EB5' }}></i>}
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: '#1B6EB5' }}>{p?.patientName || 'Unknown'}</h5>
                  <small style={{ color: '#6b7c93' }}>{p?.email}</small>
                </div>
                <div className="row g-3 mb-3">
                  {[
                    { icon: 'bi-person', label: 'Age', value: p?.age || '-' },
                    { icon: 'bi-gender-ambiguous', label: 'Gender', value: p?.gender || '-' },
                    { icon: 'bi-droplet', label: 'Blood Group', value: p?.bloodGroup || '-' },
                    { icon: 'bi-phone', label: 'Mobile', value: p?.mobileNo || '-' },
                    { icon: 'bi-geo-alt', label: 'City', value: p?.city || '-' },
                    { icon: 'bi-house', label: 'Address', value: p?.address || '-' },
                  ].map((item, i) => (
                    <div key={i} className="col-6">
                      <div className="p-2 rounded" style={{ background: '#f8fafc' }}>
                        <div className="d-flex align-items-center mb-1">
                          <i className={`bi ${item.icon} me-1`} style={{ color: '#1B6EB5', fontSize: '0.8rem' }}></i>
                          <small style={{ color: '#6b7c93' }}>{item.label}</small>
                        </div>
                        <div className="fw-medium" style={{ color: '#1a1a2e', fontSize: '0.9rem' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <hr style={{ borderColor: '#e0e6ed' }} />
                <h6 className="fw-bold mb-3" style={{ color: '#1a1a2e' }}><i className="bi bi-calendar-check me-2" style={{ color: '#1B6EB5' }}></i>Appointment</h6>
                <div className="row g-3">
                  {[
                    { label: 'Date', value: a.appointmentDate ? format(new Date(a.appointmentDate), 'MMM dd, yyyy') : '-' },
                    { label: 'Time', value: a.timeSlot ? `${a.timeSlot.startTime?.substring(0, 5)} - ${a.timeSlot.endTime?.substring(0, 5)}` : '-' },
                    { label: 'Status', value: a.appointmentStatus },
                    { label: 'Reason', value: a.remark || 'General Checkup' },
                  ].map((item, i) => (
                    <div key={i} className="col-6">
                      <small className="d-block" style={{ color: '#6b7c93' }}>{item.label}</small>
                      {item.label === 'Status' ? <StatusBadge status={item.value} /> : <span className="fw-medium" style={{ color: '#1a1a2e' }}>{item.value}</span>}
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDetailModal({ show: false, apt: null })}>Close</Button>
          {detailModal.apt?.patient && (
            <Button style={{ background: '#1B6EB5', border: 'none' }} onClick={() => { setDetailModal({ show: false, apt: null }); viewHistory(detailModal.apt.patient); }}>
              <i className="bi bi-clock-history me-1"></i>View History
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Visit History Modal */}
      <Modal show={historyModal.show} onHide={() => setHistoryModal({ show: false, data: null, loading: false })} centered size="lg">
        <Modal.Header closeButton style={{ background: '#e8f0fe', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: '#1B6EB5', fontSize: '1.1rem' }}><i className="bi bi-clock-history me-2"></i>Visit History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {historyModal.loading ? (
            <div className="text-center py-4"><div className="spinner-border" style={{ color: '#1B6EB5' }} /></div>
          ) : historyModal.data ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>{historyModal.data.patientName}</h6>
                <span className="badge px-3 py-2" style={{ background: '#1B6EB5', color: '#fff', borderRadius: 20 }}>{historyModal.data.totalVisits} visit(s)</span>
              </div>
              {historyModal.data.visits?.length === 0 ? (
                <div className="text-center py-4" style={{ color: '#6b7c93' }}><i className="bi bi-calendar-x fs-1 d-block mb-2"></i>No visit records</div>
              ) : (
                <div className="list-group list-group-flush">
                  {historyModal.data.visits.map((v) => (
                    <div key={v.appointmentId} className="list-group-item px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-medium" style={{ color: '#1a1a2e' }}>
                            {v.appointmentDate ? format(new Date(v.appointmentDate), 'MMM dd, yyyy') : '-'}
                            {v.timeSlot && <small className="ms-2" style={{ color: '#6b7c93' }}>({v.timeSlot})</small>}
                          </div>
                          <small style={{ color: '#6b7c93' }}>{v.remark || 'No remark'}</small>
                        </div>
                        <span className={`badge ${v.appointmentStatus === 'CONFIRMED' ? 'bg-success' : v.appointmentStatus === 'CANCELLED' ? 'bg-danger' : v.appointmentStatus === 'APPROVED' ? 'bg-primary' : 'bg-secondary'}`}>
                          {v.appointmentStatus}
                        </span>
                      </div>
                      {v.medicines?.length > 0 && (
                        <div className="mt-2">
                          <small className="fw-medium" style={{ color: '#1B6EB5' }}><i className="bi bi-capsule me-1"></i>Prescribed:</small>
                          <ul className="mb-0 ps-3 mt-1">
                            {v.medicines.map((m) => (
                              <li key={m.medicineId}><small><strong style={{ color: '#1a1a2e' }}>{m.medicineName}</strong> — {m.dosage} | {m.frequency} | {m.duration}</small></li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setHistoryModal({ show: false, data: null, loading: false })}>Close</Button></Modal.Footer>
      </Modal>

      {/* Prescription Modal */}
      <Modal show={prescModal.show} onHide={() => setPrescModal({ show: false, apt: null })} size="lg" centered>
        <Modal.Header closeButton style={{ background: '#e8f0fe', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: '#1B6EB5', fontSize: '1.1rem' }}>
            <i className="bi bi-capsule me-2"></i>{viewMode ? 'Prescription' : 'Add Prescription'} — {prescModal.apt?.patient?.patientName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {existingMeds.length > 0 && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2" style={{ color: '#6b7c93' }}>Existing Prescription</h6>
              <div className="table-responsive">
                <table className="table table-sm"><thead style={{ background: '#f4f8fb' }}><tr>
                  <th style={{ color: '#6b7c93', fontWeight: 600 }}>Medicine</th><th style={{ color: '#6b7c93', fontWeight: 600 }}>Dosage</th>
                  <th style={{ color: '#6b7c93', fontWeight: 600 }}>Frequency</th><th style={{ color: '#6b7c93', fontWeight: 600 }}>Duration</th><th style={{ color: '#6b7c93', fontWeight: 600 }}>Notes</th>
                </tr></thead><tbody>
                  {existingMeds.map((m) => (<tr key={m.medicineId}><td style={{ color: '#1a1a2e' }}>{m.medicineName}</td><td>{m.dosage || '-'}</td><td>{m.frequency || '-'}</td><td>{m.duration || '-'}</td><td>{m.notes || '-'}</td></tr>))}
                </tbody></table>
              </div>
            </div>
          )}
          {!viewMode || existingMeds.length === 0 ? (
            <>
              <h6 className="fw-bold mb-3" style={{ color: '#1a1a2e' }}>Add Medicines</h6>
              {medicines.map((m, i) => (
                <div key={i} className="row g-2 mb-2 align-items-end">
                  <div className="col-md-3"><input className="form-control form-control-sm" placeholder="Medicine Name *" value={m.medicineName} onChange={(e) => updateMedicineRow(i, 'medicineName', e.target.value)} /></div>
                  <div className="col-md-2"><input className="form-control form-control-sm" placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedicineRow(i, 'dosage', e.target.value)} /></div>
                  <div className="col-md-2"><input className="form-control form-control-sm" placeholder="Frequency" value={m.frequency} onChange={(e) => updateMedicineRow(i, 'frequency', e.target.value)} /></div>
                  <div className="col-md-2"><input className="form-control form-control-sm" placeholder="Duration" value={m.duration} onChange={(e) => updateMedicineRow(i, 'duration', e.target.value)} /></div>
                  <div className="col-md-2"><input className="form-control form-control-sm" placeholder="Notes" value={m.notes} onChange={(e) => updateMedicineRow(i, 'notes', e.target.value)} /></div>
                  <div className="col-md-1">{medicines.length > 1 && <button className="btn btn-sm btn-outline-danger" onClick={() => removeMedicineRow(i)}><i className="bi bi-dash"></i></button>}</div>
                </div>
              ))}
              <button className="btn btn-sm mt-2" style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 6 }} onClick={addMedicineRow}>
                <i className="bi bi-plus me-1"></i>Add Medicine
              </button>
            </>
          ) : (
            <button className="btn btn-sm" style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 6 }} onClick={() => setViewMode(false)}>
              <i className="bi bi-plus me-1"></i>Add More Medicines
            </button>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPrescModal({ show: false, apt: null })}>Close</Button>
          {(!viewMode || existingMeds.length === 0) && <Button style={{ background: '#1B6EB5', border: 'none' }} onClick={handleSavePrescription}>Save Prescription</Button>}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
