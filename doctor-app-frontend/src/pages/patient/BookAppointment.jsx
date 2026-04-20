import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { searchDoctors, bookAppointment, getAvailabilityByDoctor, getAllSlots, getFeedbacksByDoctor } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { eachDayOfInterval, parseISO, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, isSameMonth, addDays } from 'date-fns';
import CitySelect from '../../components/CitySelect';
import SpecializationSelect from '../../components/SpecializationSelect';

export default function BookAppointment() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [speciality, setSpeciality] = useState('');
  const [city, setCity] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availDates, setAvailDates] = useState([]);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorRatings, setDoctorRatings] = useState({});

  // If navigated from FindDoctors with a doctor, skip to date selection
  useEffect(() => {
    if (location.state?.doctor) {
      const doc = location.state.doctor;
      handleSelectDoctor(doc);
    }
  }, []);

  const handleSearch = async () => {
    if (!speciality && !city) {
      toast.error('Please select at least a specialization or city');
      return;
    }
    setLoadingDoctors(true);
    setDoctors([]);
    setSelectedDoctor(null);
    try {
      const params = {};
      if (speciality) params.speciality = speciality;
      if (city) params.city = city;
      const res = await searchDoctors(params);
      const docs = res.data.data || [];
      setDoctors(docs);
      if (docs.length === 0) toast('No doctors found for your criteria', { icon: 'ℹ️' });

      // Fetch ratings for all found doctors
      const ratings = {};
      await Promise.all(docs.map(async (doc) => {
        try {
          const fb = await getFeedbacksByDoctor(doc.doctorId);
          const feedbacks = fb.data.data || [];
          if (feedbacks.length > 0) {
            ratings[doc.doctorId] = {
              avg: (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1),
              count: feedbacks.length,
            };
          }
        } catch { /* ignore */ }
      }));
      setDoctorRatings(ratings);
      setStep(2);
    } catch {
      toast.error('Failed to search doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate('');
    setSelectedSlot(null);
    setSlots([]);
    setLoadingAvail(true);
    try {
      const res = await getAvailabilityByDoctor(doctor.doctorId);
      setAvailDates(res.data.data || []);
      setStep(3);
    } catch {
      toast.error('Failed to load availability');
    } finally {
      setLoadingAvail(false);
    }
  };

  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const allowedDates = useMemo(() => {
    const set = new Set();
    const today = format(new Date(), 'yyyy-MM-dd');
    availDates.forEach((a) => {
      try {
        const days = eachDayOfInterval({ start: parseISO(a.fromDate), end: parseISO(a.endDate) });
        days.forEach((d) => {
          const ds = format(d, 'yyyy-MM-dd');
          if (ds >= today) set.add(ds);
        });
      } catch { /* skip */ }
    });
    return set;
  }, [availDates]);

  // When availability loads, jump the calendar to the first available month
  useEffect(() => {
    if (allowedDates.size > 0) {
      const firstDate = [...allowedDates].sort()[0];
      setCalendarMonth(parseISO(firstDate));
    }
  }, [allowedDates]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarMonth]);

  const handleDateSelect = async (dateStr) => {
    if (!allowedDates.has(dateStr)) return;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setLoadingSlots(true);
    try {
      const res = await getAllSlots(selectedDoctor.doctorId, dateStr);
      setSlots(res.data.data || []);
      setStep(4);
    } catch {
      toast.error('Failed to load time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }
    setLoading(true);
    try {
      await bookAppointment({
        patientId: user.profileId,
        doctorId: selectedDoctor.doctorId,
        appointmentDate: selectedDate,
        remark,
        timeSlotId: selectedSlot.timeSlotId,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-plus-circle me-2 text-info"></i>Book Appointment
      </h4>

      {/* Progress Steps */}
      <div className="d-flex align-items-center mb-4 gap-2 flex-wrap">
        {['Specialization & City', 'Select Doctor', 'Select Date', 'Select Time & Confirm'].map((label, i) => (
          <div key={i} className="d-flex align-items-center">
            <span
              className={`badge rounded-pill ${step > i + 1 ? 'bg-success' : step === i + 1 ? 'bg-info' : 'bg-secondary bg-opacity-50'} px-3 py-2`}
              style={{ cursor: step > i + 1 ? 'pointer' : 'default' }}
              onClick={() => { if (step > i + 1) setStep(i + 1); }}
            >
              {step > i + 1 ? <i className="bi bi-check-lg me-1"></i> : null}
              {i + 1}. {label}
            </span>
            {i < 3 && <i className="bi bi-chevron-right text-muted mx-1"></i>}
          </div>
        ))}
      </div>

      {/* Step 1: Specialization & City */}
      {step === 1 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-search me-2"></i>Find a Doctor</h5>
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label fw-medium">Specialization</label>
                <SpecializationSelect value={speciality} onChange={(e) => setSpeciality(e.target.value)} />
              </div>
              <div className="col-md-5">
                <label className="form-label fw-medium">City</label>
                <CitySelect value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-info text-white w-100 py-2" onClick={handleSearch} disabled={loadingDoctors}>
                  {loadingDoctors ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-search me-1"></i>Search</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              <i className="bi bi-people me-2"></i>Available Doctors ({doctors.length})
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(1)}>
              <i className="bi bi-arrow-left me-1"></i>Change Search
            </button>
          </div>
          <div className="row g-3">
            {doctors.map((doc) => (
              <div key={doc.doctorId} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => handleSelectDoctor(doc)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="d-flex align-items-center">
                        {doc.profilePhoto ? (
                          <img src={doc.profilePhoto} alt={doc.doctorName} className="rounded-circle me-2" style={{ width: 40, height: 40, objectFit: 'cover', border: '2px solid #0dcaf0' }} />
                        ) : (
                          <div className="rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center me-2" style={{ width: 40, height: 40, minWidth: 40 }}>
                            <i className="bi bi-person-badge fs-5 text-info"></i>
                          </div>
                        )}
                        <div>
                        <h6 className="fw-bold mb-1">Dr. {doc.doctorName}</h6>
                        <span className="badge bg-info bg-opacity-75 mb-2">{doc.speciality}</span>
                      </div>
                      </div>
                      <span className="text-success fw-bold">₹{doc.chargedPerVisit}</span>
                    </div>
                    {doc.hospitalName && <div className="small text-muted"><i className="bi bi-building me-1"></i>{doc.hospitalName}</div>}
                    {doc.city && <div className="small text-muted"><i className="bi bi-geo-alt me-1"></i>{doc.city}</div>}
                    {doctorRatings[doc.doctorId] && (
                      <div className="small mt-1">
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        {doctorRatings[doc.doctorId].avg} ({doctorRatings[doc.doctorId].count} reviews)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Date */}
      {step === 3 && selectedDoctor && (
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0"><i className="bi bi-calendar3 me-2"></i>Select Date</h5>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(2)}>
                    <i className="bi bi-arrow-left me-1"></i>Back to Doctors
                  </button>
                </div>
                {loadingAvail ? (
                  <div className="text-center py-4"><span className="spinner-border text-info" /></div>
                ) : availDates.length === 0 ? (
                  <div className="alert alert-warning"><i className="bi bi-exclamation-triangle me-2"></i>No availability set for this doctor.</div>
                ) : (
                  <>
                    <div className="mb-3">
                      <small className="text-muted"><i className="bi bi-calendar-check me-1 text-success"></i>Available periods:</small>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {availDates.map((a, i) => (
                          <span key={i} className="badge bg-success bg-opacity-75">{a.fromDate} → {a.endDate}</span>
                        ))}
                      </div>
                    </div>
                    {/* Custom Calendar */}
                    <div className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <h6 className="mb-0 fw-bold">{format(calendarMonth, 'MMMM yyyy')}</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                      <div className="row g-0 text-center mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                          <div key={d} className="col fw-semibold text-muted small py-1">{d}</div>
                        ))}
                      </div>
                      <div className="row g-0 text-center">
                        {calendarDays.map((day, idx) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isCurrentMonth = isSameMonth(day, calendarMonth);
                          const isAvailable = allowedDates.has(dateStr);
                          const isSelected = selectedDate === dateStr;
                          return (
                            <div key={idx} className="col" style={{ minHeight: 40 }}>
                              {isCurrentMonth && (
                                <button
                                  type="button"
                                  className={`btn btn-sm w-100 ${
                                    isSelected
                                      ? 'btn-info text-white fw-bold'
                                      : isAvailable
                                        ? 'btn-outline-success fw-medium'
                                        : 'btn-light text-muted'
                                  }`}
                                  style={{
                                    borderRadius: '50%',
                                    width: 36,
                                    height: 36,
                                    padding: 0,
                                    cursor: isAvailable ? 'pointer' : 'default',
                                    opacity: isAvailable ? 1 : 0.4,
                                  }}
                                  disabled={!isAvailable}
                                  onClick={() => isAvailable && handleDateSelect(dateStr)}
                                >
                                  {format(day, 'd')}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="d-flex gap-3 mt-3" style={{ fontSize: '0.82rem' }}>
                        <span><span className="d-inline-block rounded-circle me-1" style={{ width: 12, height: 12, border: '2px solid #198754', verticalAlign: 'middle' }}></span> Available</span>
                        <span><span className="d-inline-block rounded-circle me-1" style={{ width: 12, height: 12, background: '#0dcaf0', verticalAlign: 'middle' }}></span> Selected</span>
                        <span><span className="d-inline-block rounded-circle me-1" style={{ width: 12, height: 12, background: '#e9ecef', verticalAlign: 'middle' }}></span> Unavailable</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm bg-info bg-opacity-10">
              <div className="card-body">
                <h6 className="fw-bold text-info mb-3"><i className="bi bi-person-badge me-2"></i>Selected Doctor</h6>
                <div className="mb-2"><strong>Name:</strong> Dr. {selectedDoctor.doctorName}</div>
                <div className="mb-2"><strong>Speciality:</strong> {selectedDoctor.speciality}</div>
                <div className="mb-2"><strong>Hospital:</strong> {selectedDoctor.hospitalName || 'N/A'}</div>
                <div className="mb-2"><strong>City:</strong> {selectedDoctor.city || 'N/A'}</div>
                <div><strong>Fee:</strong> <span className="text-success fw-bold">₹{selectedDoctor.chargedPerVisit}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Select Time Slot & Confirm */}
      {step === 4 && selectedDoctor && (
        <div className="row">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0"><i className="bi bi-clock me-2"></i>Select Time Slot</h5>
                  <button className="btn btn-outline-secondary btn-sm" onClick={() => setStep(3)}>
                    <i className="bi bi-arrow-left me-1"></i>Change Date
                  </button>
                </div>
                <p className="text-muted mb-3">
                  <i className="bi bi-calendar me-1"></i>{format(parseISO(selectedDate), 'EEEE, MMM dd, yyyy')} — Dr. {selectedDoctor.doctorName}
                </p>
                {loadingSlots ? (
                  <div className="text-center py-4"><span className="spinner-border text-info" /></div>
                ) : slots.length === 0 ? (
                  <div className="alert alert-warning"><i className="bi bi-exclamation-triangle me-2"></i>No time slots available for this date.</div>
                ) : (
                  <>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {slots.map((slot) => (
                        <button
                          key={slot.timeSlotId}
                          type="button"
                          className={`btn px-3 py-2 ${
                            slot.booked
                              ? 'btn-danger text-white'
                              : selectedSlot?.timeSlotId === slot.timeSlotId
                                ? 'btn-info text-white'
                                : 'btn-outline-info'
                          }`}
                          style={slot.booked ? { opacity: 0.8, cursor: 'not-allowed' } : {}}
                          disabled={slot.booked}
                          onClick={() => !slot.booked && setSelectedSlot(slot)}
                        >
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          {slot.booked && <i className="bi bi-lock-fill ms-1" style={{ fontSize: '0.75rem' }}></i>}
                        </button>
                      ))}
                    </div>
                    <div className="d-flex gap-3 mb-3" style={{ fontSize: '0.82rem' }}>
                      <span><span className="d-inline-block rounded me-1" style={{ width: 14, height: 14, background: '#0dcaf0', verticalAlign: 'middle' }}></span> Available</span>
                      <span><span className="d-inline-block rounded me-1" style={{ width: 14, height: 14, background: '#dc3545', verticalAlign: 'middle' }}></span> Booked</span>
                      {selectedSlot && <span><span className="d-inline-block rounded me-1" style={{ width: 14, height: 14, background: '#0dcaf0', border: '2px solid #0a6ebd', verticalAlign: 'middle' }}></span> Selected</span>}
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label fw-medium">Remark / Symptoms</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe your symptoms or reason for visit..."
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-info text-white w-100 py-2 fw-semibold"
                  disabled={loading || !selectedSlot}
                  onClick={handleSubmit}
                >
                  {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-check-circle me-2"></i>}
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm bg-info bg-opacity-10">
              <div className="card-body">
                <h6 className="fw-bold text-info mb-3"><i className="bi bi-receipt me-2"></i>Booking Summary</h6>
                <div className="mb-2"><strong>Doctor:</strong> Dr. {selectedDoctor.doctorName}</div>
                <div className="mb-2"><strong>Speciality:</strong> {selectedDoctor.speciality}</div>
                <div className="mb-2"><strong>Date:</strong> {format(parseISO(selectedDate), 'MMM dd, yyyy')}</div>
                {selectedSlot && <div className="mb-2"><strong>Time:</strong> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</div>}
                <div className="mb-2"><strong>City:</strong> {selectedDoctor.city || 'N/A'}</div>
                <hr />
                <div className="fw-bold text-success fs-5">Fee: ₹{selectedDoctor.chargedPerVisit}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
