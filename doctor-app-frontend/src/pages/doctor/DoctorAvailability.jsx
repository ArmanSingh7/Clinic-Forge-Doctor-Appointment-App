import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addAvailability, updateAvailability, deleteAvailability, getAvailabilityByDoctor, getAllSlots } from '../../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import { format, addDays, eachDayOfInterval, isAfter, isBefore, isToday } from 'date-fns';
import toast from 'react-hot-toast';

export default function DoctorAvailability() {
  const { user } = useAuth();
  const [form, setForm] = useState({ fromDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [editModal, setEditModal] = useState({ show: false, item: null });
  const [editForm, setEditForm] = useState({ fromDate: '', endDate: '' });

  // Slots management
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarWeekStart, setCalendarWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Quick info stats
  const [activeCount, setActiveCount] = useState(0);
  const [totalSlotDays, setTotalSlotDays] = useState(0);

  useEffect(() => { loadDates(); }, []);

  useEffect(() => {
    if (dates.length > 0) {
      const now = new Date();
      const active = dates.filter(d => new Date(d.endDate) >= now).length;
      setActiveCount(active);
      const days = dates.reduce((sum, d) => {
        const start = new Date(d.fromDate);
        const end = new Date(d.endDate);
        return sum + Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
      }, 0);
      setTotalSlotDays(days);
    }
  }, [dates]);

  const loadDates = async () => {
    try {
      const res = await getAvailabilityByDoctor(user.profileId);
      setDates(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoadingDates(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.endDate) < new Date(form.fromDate)) {
      toast.error('End date must be after start date');
      return;
    }
    setLoading(true);
    try {
      await addAvailability({
        doctor: { doctorId: user.profileId },
        fromDate: form.fromDate,
        endDate: form.endDate,
      });
      toast.success('Availability added!');
      setForm({ fromDate: '', endDate: '' });
      loadDates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add availability');
    } finally { setLoading(false); }
  };

  const openEdit = (item) => {
    setEditForm({ fromDate: item.fromDate, endDate: item.endDate });
    setEditModal({ show: true, item });
  };

  const handleEditSave = async () => {
    if (new Date(editForm.endDate) < new Date(editForm.fromDate)) {
      toast.error('End date must be after start date');
      return;
    }
    try {
      await updateAvailability({
        availabilityId: editModal.item.availabilityId,
        doctor: { doctorId: user.profileId },
        fromDate: editForm.fromDate,
        endDate: editForm.endDate,
      });
      toast.success('Availability updated!');
      setEditModal({ show: false, item: null });
      loadDates();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await deleteAvailability(item.availabilityId);
      toast.success('Availability deleted');
      loadDates();
    } catch { toast.error('Failed to delete'); }
  };

  // Load slots for a selected date
  const loadSlots = async (dateStr) => {
    setSelectedDate(dateStr);
    setLoadingSlots(true);
    try {
      const res = await getAllSlots(user.profileId, dateStr);
      setSlots(res.data.data || []);
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  };

  // Check if a date falls within any availability range
  const isDateAvailable = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dates.some(d => dateStr >= d.fromDate && dateStr <= d.endDate);
  };

  // Quick add presets
  const addQuickPreset = (label) => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    switch (label) {
      case 'today':
        setForm({ fromDate: todayStr, endDate: todayStr });
        break;
      case 'week':
        setForm({ fromDate: todayStr, endDate: format(addDays(today, 6), 'yyyy-MM-dd') });
        break;
      case 'twoweeks':
        setForm({ fromDate: todayStr, endDate: format(addDays(today, 13), 'yyyy-MM-dd') });
        break;
      case 'month':
        setForm({ fromDate: todayStr, endDate: format(addDays(today, 29), 'yyyy-MM-dd') });
        break;
    }
  };

  // Calendar week view
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(calendarWeekStart, i));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>
          <span className="d-inline-flex align-items-center justify-content-center me-2" style={{ width: 38, height: 38, borderRadius: '50%', background: '#e8f0fe' }}>
            <i className="bi bi-clock" style={{ color: '#1B6EB5', fontSize: '1rem' }}></i>
          </span>
          Manage Availability
        </h4>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { icon: 'bi-calendar-check', label: 'Active Slots', value: activeCount, color: '#198754' },
          { icon: 'bi-calendar-range', label: 'Total Ranges', value: dates.length, color: '#1B6EB5' },
          { icon: 'bi-calendar-day', label: 'Total Days', value: totalSlotDays, color: '#6f42c1' },
          { icon: 'bi-calendar-x', label: 'Expired', value: dates.filter(d => new Date(d.endDate) < new Date()).length, color: '#dc3545' },
        ].map((s, i) => (
          <div key={i} className="col-md-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12, background: '#e8f0fe' }}>
              <div className="card-body d-flex align-items-center p-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{ width: 40, height: 40, minWidth: 40, background: '#fff', border: `2px solid ${s.color}` }}>
                  <i className={`bi ${s.icon}`} style={{ color: s.color }}></i>
                </div>
                <div>
                  <div className="small" style={{ color: '#6b7c93' }}>{s.label}</div>
                  <h5 className="mb-0 fw-bold" style={{ color: '#1a1a2e' }}>{s.value}</h5>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Left: Add Availability Form */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white" style={{ borderBottom: '1px solid #e8eef3', borderRadius: '12px 12px 0 0' }}>
              <h6 className="mb-0 fw-semibold" style={{ color: '#1a1a2e' }}>
                <i className="bi bi-plus-circle me-2" style={{ color: '#1B6EB5' }}></i>Add Available Dates
              </h6>
            </div>
            <div className="card-body p-4">
              {/* Quick Presets */}
              <div className="mb-3">
                <small className="fw-medium d-block mb-2" style={{ color: '#6b7c93' }}>Quick Add:</small>
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: 'This Week' },
                    { key: 'twoweeks', label: '2 Weeks' },
                    { key: 'month', label: '1 Month' },
                  ].map((p) => (
                    <button key={p.key} className="btn btn-sm" style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 20, fontSize: '0.78rem' }}
                      onClick={() => addQuickPreset(p.key)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-medium" style={{ color: '#6b7c93' }}>From Date *</label>
                  <input type="date" className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }}
                    value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-medium" style={{ color: '#6b7c93' }}>End Date *</label>
                  <input type="date" className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }}
                    value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    min={form.fromDate || new Date().toISOString().split('T')[0]} required />
                </div>
                <button type="submit" className="btn w-100 py-2 fw-semibold" style={{ background: '#1B6EB5', color: '#fff', border: 'none', borderRadius: 8 }} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-plus-circle me-2"></i>}
                  Add Availability
                </button>
              </form>
            </div>
          </div>

          {/* Week Calendar */}
          <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #e8eef3', borderRadius: '12px 12px 0 0' }}>
              <button className="btn btn-sm" style={{ color: '#1B6EB5' }}
                onClick={() => setCalendarWeekStart(addDays(calendarWeekStart, -7))}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <h6 className="mb-0 fw-semibold" style={{ color: '#1a1a2e', fontSize: '0.9rem' }}>
                {format(weekDays[0], 'MMM dd')} — {format(weekDays[6], 'MMM dd, yyyy')}
              </h6>
              <button className="btn btn-sm" style={{ color: '#1B6EB5' }}
                onClick={() => setCalendarWeekStart(addDays(calendarWeekStart, 7))}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
            <div className="card-body p-2">
              <div className="d-flex gap-1">
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const available = isDateAvailable(day);
                  const today = isToday(day);
                  const selected = selectedDate === dateStr;
                  return (
                    <div key={dateStr} className="flex-fill text-center p-2 rounded" style={{
                      cursor: 'pointer',
                      background: selected ? '#1B6EB5' : available ? '#e8f0fe' : '#f8f9fa',
                      border: today ? '2px solid #1B6EB5' : '2px solid transparent',
                      borderRadius: 10,
                      transition: 'all 0.2s',
                    }} onClick={() => loadSlots(dateStr)}>
                      <small className="d-block" style={{ color: selected ? '#fff' : '#6b7c93', fontSize: '0.7rem' }}>
                        {format(day, 'EEE')}
                      </small>
                      <div className="fw-bold" style={{ color: selected ? '#fff' : '#1a1a2e', fontSize: '1.1rem' }}>
                        {format(day, 'dd')}
                      </div>
                      {available && (
                        <div className="rounded-circle mx-auto" style={{ width: 6, height: 6, background: selected ? '#fff' : '#198754' }}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Slots for Selected Date */}
          {selectedDate && (
            <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: 12 }}>
              <div className="card-header bg-white" style={{ borderBottom: '1px solid #e8eef3', borderRadius: '12px 12px 0 0' }}>
                <h6 className="mb-0 fw-semibold" style={{ color: '#1a1a2e', fontSize: '0.9rem' }}>
                  <i className="bi bi-clock me-2" style={{ color: '#1B6EB5' }}></i>
                  Time Slots — {format(new Date(selectedDate + 'T00:00:00'), 'EEE, MMM dd')}
                </h6>
              </div>
              <div className="card-body">
                {loadingSlots ? (
                  <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: '#1B6EB5' }} /></div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-3" style={{ color: '#6b7c93' }}>
                    <i className="bi bi-clock fs-3 d-block mb-2" style={{ color: '#c5d5e4' }}></i>
                    <small>No time slots for this date</small>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <div key={slot.timeSlotId} className="px-3 py-2 rounded"
                        style={{
                          background: slot.booked ? '#f8d7da' : '#e8f0fe',
                          border: `1px solid ${slot.booked ? '#dc3545' : '#1B6EB5'}`,
                          borderRadius: 10,
                          fontSize: '0.85rem',
                        }}>
                        <i className={`bi ${slot.booked ? 'bi-lock-fill' : 'bi-clock'} me-1`}
                          style={{ color: slot.booked ? '#dc3545' : '#1B6EB5' }}></i>
                        <span style={{ color: slot.booked ? '#dc3545' : '#1B6EB5', fontWeight: 600 }}>
                          {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                        </span>
                        <small className="d-block" style={{ color: slot.booked ? '#dc3545' : '#198754', fontSize: '0.7rem' }}>
                          {slot.booked ? 'Booked' : 'Available'}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Current Availability List */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #e8eef3', borderRadius: '12px 12px 0 0' }}>
              <h6 className="mb-0 fw-semibold" style={{ color: '#1a1a2e' }}>
                <i className="bi bi-calendar-range me-2" style={{ color: '#1B6EB5' }}></i>Current Availability
              </h6>
              <span className="badge px-3 py-2" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 20 }}>{dates.length} slots</span>
            </div>
            <div className="card-body">
              {loadingDates ? (
                <div className="text-center py-3"><div className="spinner-border spinner-border-sm" style={{ color: '#1B6EB5' }} /></div>
              ) : dates.length === 0 ? (
                <div className="text-center py-4" style={{ color: '#6b7c93' }}>
                  <i className="bi bi-calendar-x fs-3 d-block mb-2"></i>
                  No availability dates set yet
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {dates.sort((a, b) => a.fromDate.localeCompare(b.fromDate)).map((d) => {
                    const isActive = new Date(d.endDate) >= new Date();
                    const dayCount = Math.round((new Date(d.endDate) - new Date(d.fromDate)) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <div key={d.availabilityId} className="list-group-item px-0 py-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="d-flex align-items-start">
                            <div className="d-flex align-items-center justify-content-center me-3"
                              style={{ width: 44, height: 44, minWidth: 44, borderRadius: 10, background: isActive ? '#e8f0fe' : '#f8f9fa' }}>
                              <i className={`bi ${isActive ? 'bi-calendar-check' : 'bi-calendar-x'}`}
                                style={{ color: isActive ? '#1B6EB5' : '#dc3545' }}></i>
                            </div>
                            <div>
                              <div className="fw-medium" style={{ color: '#1a1a2e' }}>
                                {format(new Date(d.fromDate), 'MMM dd, yyyy')}
                                <span className="mx-2" style={{ color: '#6b7c93' }}>→</span>
                                {format(new Date(d.endDate), 'MMM dd, yyyy')}
                              </div>
                              <div className="d-flex gap-2 mt-1">
                                <span className="badge" style={{ background: isActive ? '#e6f7f2' : '#f8d7da', color: isActive ? '#198754' : '#dc3545', borderRadius: 12, fontSize: '0.7rem' }}>
                                  {isActive ? 'Active' : 'Expired'}
                                </span>
                                <span className="badge" style={{ background: '#f0f0f0', color: '#6b7c93', borderRadius: 12, fontSize: '0.7rem' }}>
                                  {dayCount} day(s)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm" style={{ background: '#fff4e5', color: '#E8A838', border: '1px solid #E8A838', borderRadius: 6 }}
                              onClick={() => openEdit(d)} title="Edit">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6 }}
                              onClick={() => handleDelete(d)} title="Delete">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Availability Modal */}
      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, item: null })} centered>
        <Modal.Header closeButton style={{ background: '#e8f0fe', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: '#1B6EB5', fontSize: '1.1rem' }}><i className="bi bi-pencil-square me-2"></i>Edit Availability</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: '#6b7c93' }}>From Date</Form.Label>
              <Form.Control type="date" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={editForm.fromDate} onChange={(e) => setEditForm({ ...editForm, fromDate: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium" style={{ color: '#6b7c93' }}>End Date</Form.Label>
              <Form.Control type="date" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} min={editForm.fromDate} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal({ show: false, item: null })}>Cancel</Button>
          <Button style={{ background: '#1B6EB5', border: 'none' }} onClick={handleEditSave}><i className="bi bi-check-lg me-1"></i>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
