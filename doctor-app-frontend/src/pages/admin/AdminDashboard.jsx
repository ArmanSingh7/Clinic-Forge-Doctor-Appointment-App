import { useEffect, useState } from 'react';
import { getAllDoctors, getAllPatients, getAllAppointments } from '../../services/api';
import StatCard from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [docRes, patRes, aptRes] = await Promise.all([
        getAllDoctors(),
        getAllPatients(),
        getAllAppointments(),
      ]);
      setDoctors(docRes.data.data || []);
      setPatients(patRes.data.data || []);
      setAppointments(aptRes.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const statusData = ['PENDING', 'APPROVED', 'CONFIRMED', 'REJECTED', 'CANCELLED'].map((s) => ({
    status: s,
    count: appointments.filter((a) => a.appointmentStatus === s).length,
  }));

  const recentApts = [...appointments]
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 5);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-info" /></div>;

  return (
    <div>
      <h4 className="fw-bold mb-4"><i className="bi bi-speedometer2 me-2 text-info"></i>Admin Dashboard</h4>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard icon="bi-heart-pulse" label="Total Doctors" value={doctors.length} color="info" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-people" label="Total Patients" value={patients.length} color="primary" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-calendar-check" label="Total Appointments" value={appointments.length} color="success" />
        </div>
        <div className="col-md-3">
          <StatCard icon="bi-hourglass-split" label="Pending" value={appointments.filter((a) => a.appointmentStatus === 'PENDING').length} color="warning" />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-bar-chart me-2"></i>Appointments by Status</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0dcaf0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold"><i className="bi bi-clock-history me-2"></i>Recent Appointments</h6>
            </div>
            <div className="card-body p-0">
              {recentApts.length === 0 ? (
                <div className="text-center text-muted py-4">No appointments</div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentApts.map((apt) => (
                    <div key={apt.appointmentId} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-medium">{apt.patient?.patientName} → Dr. {apt.doctor?.doctorName}</div>
                          <small className="text-muted">{apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd, yyyy') : '-'}</small>
                        </div>
                        <StatusBadge status={apt.appointmentStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* City-filtered Patients & Doctors */}
      {(() => {
        const allCities = [...new Set([
          ...patients.map(p => p.city).filter(Boolean),
          ...doctors.map(d => d.city).filter(Boolean),
        ])].sort();

        const filteredPatients = cityFilter ? patients.filter(p => p.city === cityFilter) : patients;
        const filteredDoctors = cityFilter ? doctors.filter(d => d.city === cityFilter) : doctors;

        return (
          <div className="mt-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0"><i className="bi bi-geo-alt me-2 text-info"></i>People by Location</h5>
              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  style={{ width: 200, borderRadius: 8 }}
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {allCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {cityFilter && (
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setCityFilter('')}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="row g-3">
              {/* Patients List - Left */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold"><i className="bi bi-people-fill me-2" style={{ color: '#1B6EB5' }}></i>Patients</h6>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">{filteredPatients.length}</span>
                  </div>
                  <div className="card-body p-0" style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {filteredPatients.length === 0 ? (
                      <div className="text-center text-muted py-4"><i className="bi bi-inbox fs-4 d-block mb-1"></i>No patients{cityFilter ? ` in ${cityFilter}` : ''}</div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {filteredPatients.map(p => (
                          <div key={p.patientId} className="list-group-item px-3 py-2">
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center justify-content-center me-2" style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8f0fe', flexShrink: 0 }}>
                                {p.profilePhoto ? (
                                  <img src={p.profilePhoto} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <i className="bi bi-person" style={{ color: '#1B6EB5' }}></i>
                                )}
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{p.patientName}</div>
                                <div className="d-flex gap-3" style={{ fontSize: '0.78rem', color: '#6b7c93' }}>
                                  {p.city && <span><i className="bi bi-geo-alt me-1"></i>{p.city}</span>}
                                  {p.email && <span><i className="bi bi-envelope me-1"></i>{p.email}</span>}
                                </div>
                              </div>
                              {p.age && <span className="badge bg-light text-dark border" style={{ fontSize: '0.75rem' }}>{p.age}y</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctors List - Right */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold"><i className="bi bi-heart-pulse-fill me-2" style={{ color: '#3DB39E' }}></i>Doctors</h6>
                    <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">{filteredDoctors.length}</span>
                  </div>
                  <div className="card-body p-0" style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {filteredDoctors.length === 0 ? (
                      <div className="text-center text-muted py-4"><i className="bi bi-inbox fs-4 d-block mb-1"></i>No doctors{cityFilter ? ` in ${cityFilter}` : ''}</div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {filteredDoctors.map(d => (
                          <div key={d.doctorId} className="list-group-item px-3 py-2">
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center justify-content-center me-2" style={{ width: 36, height: 36, borderRadius: '50%', background: '#e6f7f3', flexShrink: 0 }}>
                                {d.profilePhoto ? (
                                  <img src={d.profilePhoto} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <i className="bi bi-heart-pulse" style={{ color: '#3DB39E' }}></i>
                                )}
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-medium" style={{ fontSize: '0.9rem' }}>Dr. {d.doctorName}</div>
                                <div className="d-flex gap-3" style={{ fontSize: '0.78rem', color: '#6b7c93' }}>
                                  <span className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: '0.72rem' }}>{d.speciality}</span>
                                  {d.city && <span><i className="bi bi-geo-alt me-1"></i>{d.city}</span>}
                                </div>
                              </div>
                              <span className="text-success fw-semibold" style={{ fontSize: '0.85rem' }}>₹{d.chargedPerVisit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
