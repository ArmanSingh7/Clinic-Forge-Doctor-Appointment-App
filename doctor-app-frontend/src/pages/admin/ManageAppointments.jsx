import { useEffect, useState } from 'react';
import { getAllAppointments, approveAppointment, rejectAppointment, deleteAppointment } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getAllAppointments();
      setAppointments(res.data.data || []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try { await approveAppointment(id); toast.success('Approved'); load(); } catch { toast.error('Failed'); }
  };
  const handleReject = async (id) => {
    if (!window.confirm('Reject this appointment?')) return;
    try { await rejectAppointment(id); toast.success('Rejected'); load(); } catch { toast.error('Failed'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment permanently?')) return;
    try { await deleteAppointment(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const filtered = filter === 'ALL' ? appointments : appointments.filter((a) => a.appointmentStatus === filter);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-info" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0"><i className="bi bi-calendar-check me-2 text-info"></i>Manage Appointments</h4>
        <span className="badge bg-info fs-6">{appointments.length} total</span>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['ALL', 'PENDING', 'APPROVED', 'CONFIRMED', 'REJECTED', 'CANCELLED'].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-info text-white' : 'btn-outline-secondary'}`} onClick={() => setFilter(s)}>
            {s} {s !== 'ALL' && `(${appointments.filter((a) => a.appointmentStatus === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted py-5">
          <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>No appointments found
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th>Remark</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((apt, idx) => (
                  <tr key={apt.appointmentId}>
                    <td>{idx + 1}</td>
                    <td className="fw-medium">{apt.patient?.patientName}</td>
                    <td>Dr. {apt.doctor?.doctorName}<br /><small className="text-muted">{apt.doctor?.speciality}</small></td>
                    <td>{apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM dd, yyyy') : '-'}</td>
                    <td><StatusBadge status={apt.appointmentStatus} /></td>
                    <td className="text-muted">{apt.remark || '-'}</td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {apt.appointmentStatus === 'PENDING' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleApprove(apt.appointmentId)}>
                              <i className="bi bi-check-lg me-1"></i>Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleReject(apt.appointmentId)}>
                              <i className="bi bi-x-lg me-1"></i>Reject
                            </button>
                          </>
                        )}
                        {apt.appointmentStatus === 'APPROVED' && (
                          <span className="badge bg-info py-2 px-3">Waiting for Doctor</span>
                        )}
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleDelete(apt.appointmentId)} title="Delete">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
