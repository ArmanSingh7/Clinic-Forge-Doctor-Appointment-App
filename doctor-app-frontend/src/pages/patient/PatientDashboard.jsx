import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientById, getAllAppointments, getMedicinesByAppointment } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentMeds, setRecentMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [patRes, aptRes] = await Promise.all([
        getPatientById(user.profileId),
        getAllAppointments(),
      ]);
      setPatient(patRes.data.data);
      const all = aptRes.data.data || [];
      const mine = all.filter((a) => a.patient?.patientId === user.profileId);
      setAppointments(mine);

      // Load prescriptions from all completed appointments
      const completed = mine
        .filter((a) => ['CONFIRMED', 'APPROVED'].includes(a.appointmentStatus))
        .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      const medsPromises = completed.map((a) =>
        getMedicinesByAppointment(a.appointmentId)
          .then((res) => ({ apt: a, medicines: res.data.data || [] }))
          .catch(() => ({ apt: a, medicines: [] }))
      );
      const medsResults = await Promise.all(medsPromises);
      setRecentMeds(medsResults.filter((r) => r.medicines.length > 0));
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const total = appointments.length;
  const pending = appointments.filter((a) => a.appointmentStatus === 'PENDING').length;
  const confirmed = appointments.filter((a) => a.appointmentStatus === 'CONFIRMED').length;
  const upcoming = appointments
    .filter((a) => ['PENDING', 'APPROVED', 'CONFIRMED'].includes(a.appointmentStatus))
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 5);
  const uniqueDoctors = [...new Set(appointments.filter((a) => a.appointmentStatus === 'CONFIRMED').map((a) => a.doctor?.doctorId))].length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#1B6EB5' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h4 className="fw-bold mb-4" style={{ color: '#1a1a2e' }}>Dashboard</h4>

      {/* Stat Cards Row */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-calendar-check-fill', label: 'Total Appointments', value: total },
          { icon: 'bi-hourglass-split', label: 'Pending', value: pending },
          { icon: 'bi-check-circle-fill', label: 'Confirmed', value: confirmed },
          { icon: 'bi-heart-pulse-fill', label: 'Doctors Visited', value: uniqueDoctors },
        ].map((stat, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100 dashboard-stat-card" style={{ borderRadius: 12, background: '#e8f0fe' }}>
              <div className="card-body d-flex align-items-center p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: 52, height: 52, minWidth: 52, border: '2px solid #1B6EB5', background: '#fff' }}>
                  <i className={`bi ${stat.icon} fs-5`} style={{ color: '#1B6EB5' }}></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold" style={{ color: '#1a1a2e' }}>{stat.value}</h3>
                  <small style={{ color: '#6b7c93' }}>{stat.label}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Upcoming Appointments */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, background: '#e8f0fe' }}>
            <div className="card-header border-bottom d-flex justify-content-between align-items-center px-4 pt-3" style={{ background: 'transparent', borderColor: '#d0dce8' }}>
              <h6 className="mb-0 fw-bold" style={{ color: '#1a1a2e' }}>
                <i className="bi bi-clock me-2" style={{ color: '#1B6EB5' }}></i>Upcoming Appointments
              </h6>
              <button className="btn btn-sm" style={{ background: '#fff', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 20, fontSize: '0.8rem' }}
                onClick={() => navigate('/patient/appointments')}>View All</button>
            </div>
            <div className="card-body p-0">
              {upcoming.length === 0 ? (
                <div className="text-center py-5" style={{ color: '#6b7c93' }}>
                  <i className="bi bi-calendar-x fs-1 d-block mb-2" style={{ color: '#a8c4de' }}></i>
                  No upcoming appointments
                </div>
              ) : (
                <div className="list-group list-group-flush" style={{ background: 'transparent' }}>
                  {upcoming.map((apt) => (
                    <div key={apt.appointmentId} className="list-group-item px-4 py-3 border-0 border-bottom" style={{ background: 'transparent', borderColor: '#d0dce8' }}>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ width: 44, height: 44, minWidth: 44, background: '#fff', border: '2px solid #1B6EB5' }}>
                          <i className="bi bi-person-fill" style={{ color: '#1B6EB5' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold" style={{ color: '#1B6EB5' }}>{apt.doctor?.doctorName}</div>
                          <small style={{ color: '#6b7c93' }}>{apt.doctor?.speciality}</small>
                        </div>
                        <div className="text-end">
                          <div className="small fw-medium" style={{ color: '#1a1a2e' }}>{apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd') : '-'}</div>
                          {apt.timeSlot && (
                            <span className="badge rounded-pill" style={{ background: '#fff', color: '#1B6EB5', fontSize: '0.7rem', border: '1px solid #1B6EB5' }}>
                              {apt.timeSlot.startTime?.slice(0, 5)}
                            </span>
                          )}
                          <div className="mt-1"><StatusBadge status={apt.appointmentStatus} /></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-header border-bottom px-4 pt-3" style={{ background: '#fff', borderColor: '#e8eef3' }}>
              <h6 className="mb-0 fw-bold" style={{ color: '#1a1a2e' }}>
                <i className="bi bi-capsule me-2" style={{ color: '#3DB39E' }}></i>Prescriptions
              </h6>
            </div>
            <div className="card-body px-4" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {recentMeds.length === 0 ? (
                <div className="text-center py-4" style={{ color: '#6b7c93' }}>
                  <i className="bi bi-file-medical fs-1 d-block mb-2" style={{ color: '#c5d5e4' }}></i>
                  No prescriptions
                </div>
              ) : (
                recentMeds.map((r, i) => (
                  <div key={i} className={`${i > 0 ? 'mt-3 pt-3 border-top' : ''}`}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="fw-semibold" style={{ color: '#1B6EB5' }}>Dr. {r.apt.doctor?.doctorName}</small>
                      <small style={{ color: '#6b7c93' }}>{r.apt.appointmentDate ? format(new Date(r.apt.appointmentDate), 'MMM dd, yyyy') : ''}</small>
                    </div>
                    {r.medicines.map((m) => (
                      <div key={m.medicineId} className="d-flex align-items-center mb-1">
                        <i className="bi bi-capsule me-2" style={{ color: '#3DB39E' }}></i>
                        <small><strong style={{ color: '#1a1a2e' }}>{m.medicineName}</strong> — {m.dosage} | {m.frequency}</small>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-3">
        {[
          { icon: 'bi-calendar-plus', label: 'Book Appointment', path: '/patient/book' },
          { icon: 'bi-search', label: 'Find Doctors', path: '/patient/doctors' },
          { icon: 'bi-person-circle', label: 'My Profile', path: '/patient/profile' },
        ].map((action, i) => (
          <div key={i} className="col-md-4">
            <div className="card border-0 shadow-sm dashboard-action-card" style={{ cursor: 'pointer', borderRadius: 12 }} onClick={() => navigate(action.path)}>
              <div className="card-body d-flex align-items-center p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: 44, height: 44, minWidth: 44, background: '#e8f0fe' }}>
                  <i className={`bi ${action.icon}`} style={{ color: '#1B6EB5' }}></i>
                </div>
                <span className="fw-medium" style={{ color: '#1a1a2e' }}>{action.label}</span>
                <i className="bi bi-chevron-right ms-auto" style={{ color: '#6b7c93' }}></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
