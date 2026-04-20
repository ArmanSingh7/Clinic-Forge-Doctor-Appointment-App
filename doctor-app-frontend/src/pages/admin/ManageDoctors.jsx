import { useEffect, useState } from 'react';
import { getAllDoctors, removeDoctor, updateDoctor, getAvailabilityByDoctor, updateAvailability, deleteAvailability, addAvailability, registerDoctor, getDocumentsByDoctor, downloadDocument } from '../../services/api';
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import SpecializationSelect from '../../components/SpecializationSelect';
import CitySelect from '../../components/CitySelect';

const SPECIALITY_COLORS = {
  // General
  Physician: '#0d6efd', 'General Physician': '#0d6efd', 'General Practitioner': '#0d6efd',
  // Surgical
  Surgeon: '#198754', 'General Surgeon': '#198754', 'Vascular Surgeon': '#20c997',
  // Neurology
  Neurologist: '#6f42c1', Neurosurgeon: '#6f42c1',
  // Cardiology
  Cardiologist: '#dc3545', 'Cardiac Surgeon': '#c0392b',
  // Skin
  Dermatologist: '#fd7e14',
  // Lungs
  Pulmonologist: '#d63384', 'Pulmonologist/Respirologist': '#d63384',
  // ENT
  ENT: '#0dcaf0', Otolaryngologist: '#0dcaf0',
  // Bones
  Orthopedic: '#e67e22', Orthopaedic: '#e67e22', Orthopaedics: '#e67e22',
  // Stomach
  Gastroenterologist: '#f39c12',
  // Kidneys
  Nephrologist: '#2980b9', Urologist: '#3498db',
  // Liver
  Hepatologist: '#8e44ad', 'Liver Transplant': '#8e44ad',
  // Eye
  Ophthalmologist: '#16a085', Ophthalmology: '#16a085',
  // Dentist
  Dentist: '#1abc9c', 'Dental Surgeon': '#1abc9c', 'Dental Medicine': '#1abc9c',
  // Radiology
  Radiologist: '#7f8c8d', 'Radiology': '#7f8c8d',
  // Internal
  'Internal Medicine': '#2c3e50',
  // Oncology
  Oncologist: '#e74c3c',
  // Gynaecology
  Gynaecologist: '#e91e8c', OBG: '#e91e8c', 'OB-GYN': '#e91e8c',
  // Haematology
  Haematologist: '#c0392b', Hematologist: '#c0392b',
  // Diabetes
  Endocrinologist: '#27ae60', Diabetologist: '#27ae60',
  // Paediatrics
  Pediatrician: '#0dcaf0', Paediatrician: '#0dcaf0',
  // Psychiatry
  Psychiatrist: '#6610f2', Psychologist: '#6610f2',
  // Spine
  'Spine Surgeon': '#2ecc71',
  // Emergency
  'Emergency Medicine': '#e74c3c',
};

// Fallback: deterministic color from specialty name
const hashColor = (str = '') => {
  const palette = ['#1B6EB5','#3DB39E','#E8A838','#9B59B6','#E84545','#16a085','#2980b9','#8e44ad','#e67e22','#27ae60'];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState({ show: false, doc: null });
  const [editForm, setEditForm] = useState({});
  const [profileModal, setProfileModal] = useState({ show: false, doc: null });
  const [removeModal, setRemoveModal] = useState({ show: false, doc: null });
  const [availModal, setAvailModal] = useState({ show: false, doc: null, dates: [] });
  const [editAvailModal, setEditAvailModal] = useState({ show: false, item: null });
  const [editAvailForm, setEditAvailForm] = useState({ fromDate: '', endDate: '' });
  const [addAvailForm, setAddAvailForm] = useState({ fromDate: '', endDate: '' });
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ userName: '', password: '', confirmPassword: '', doctorName: '', speciality: '', location: '', hospitalName: '', mobileNo: '', email: '', chargedPerVisit: '', city: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [docsModal, setDocsModal] = useState({ show: false, doctorName: '', docs: [], loading: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getAllDoctors();
      setDoctors(res.data.data || []);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    const doc = removeModal.doc;
    if (!doc) return;
    try {
      await removeDoctor(doc);
      toast.success('Doctor removed');
      setRemoveModal({ show: false, doc: null });
      load();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const openEdit = (doc) => {
    setEditForm({ ...doc });
    setEditModal({ show: true, doc });
  };

  const handleSave = async () => {
    try {
      await updateDoctor(editForm);
      toast.success('Doctor updated!');
      setEditModal({ show: false, doc: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const openAvail = async (doc) => {
    try {
      const res = await getAvailabilityByDoctor(doc.doctorId);
      setAvailModal({ show: true, doc, dates: res.data.data || [] });
    } catch {
      setAvailModal({ show: true, doc, dates: [] });
    }
  };

  const reloadAvail = async () => {
    if (!availModal.doc) return;
    try {
      const res = await getAvailabilityByDoctor(availModal.doc.doctorId);
      setAvailModal((prev) => ({ ...prev, dates: res.data.data || [] }));
    } catch { /* silent */ }
  };

  const openEditAvail = (item) => {
    setEditAvailForm({ fromDate: item.fromDate, endDate: item.endDate });
    setEditAvailModal({ show: true, item });
  };

  const handleEditAvailSave = async () => {
    if (new Date(editAvailForm.endDate) < new Date(editAvailForm.fromDate)) {
      toast.error('End date must be after start date');
      return;
    }
    try {
      await updateAvailability({
        availabilityId: editAvailModal.item.availabilityId,
        doctor: { doctorId: availModal.doc.doctorId },
        fromDate: editAvailForm.fromDate,
        endDate: editAvailForm.endDate,
      });
      toast.success('Availability updated');
      setEditAvailModal({ show: false, item: null });
      reloadAvail();
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleDeleteAvail = async (item) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await deleteAvailability(item.availabilityId);
      toast.success('Availability deleted');
      reloadAvail();
    } catch {
      toast.error('Failed to delete availability');
    }
  };

  const handleAddAvail = async (e) => {
    e.preventDefault();
    if (new Date(addAvailForm.endDate) < new Date(addAvailForm.fromDate)) {
      toast.error('End date must be after start date');
      return;
    }
    try {
      await addAvailability({
        doctor: { doctorId: availModal.doc.doctorId },
        fromDate: addAvailForm.fromDate,
        endDate: addAvailForm.endDate,
      });
      toast.success('Availability added');
      setAddAvailForm({ fromDate: '', endDate: '' });
      reloadAvail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add availability');
    }
  };

  const getInitials = (name) => (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const getSpecColor = (spec) => SPECIALITY_COLORS[spec] || hashColor(spec);

  const handleAddDoctor = async () => {
    if (!addForm.userName || !addForm.password || !addForm.confirmPassword || !addForm.doctorName || !addForm.speciality || !addForm.email) {
      toast.error('Please fill all required fields');
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setAddLoading(true);
    try {
      await registerDoctor(addForm);
      toast.success('Doctor added successfully!');
      setAddModal(false);
      setAddForm({ userName: '', password: '', confirmPassword: '', doctorName: '', speciality: '', location: '', hospitalName: '', mobileNo: '', email: '', chargedPerVisit: '', city: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.fieldErrors ? Object.values(err.response.data.fieldErrors).join(', ') : 'Failed to add doctor');
    } finally {
      setAddLoading(false);
    }
  };

  const viewDoctorDocs = async (doc) => {
    setDocsModal({ show: true, doctorName: doc.doctorName, docs: [], loading: true });
    try {
      const res = await getDocumentsByDoctor(doc.doctorId);
      setDocsModal({ show: true, doctorName: doc.doctorName, docs: res.data.data || [], loading: false });
    } catch {
      toast.error('Failed to load documents');
      setDocsModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDownloadDoc = async (doc) => {
    try {
      const res = await downloadDocument(doc.documentId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download document');
    }
  };

  const filtered = doctors.filter(
    (d) =>
      d.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      d.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      d.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: 400 }}>
      <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }} />
      <p className="text-muted">Loading doctors...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-heart-pulse me-2 text-info"></i>Manage Doctors</h4>
          <p className="text-muted mb-0 small">View and manage all registered doctors</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 fs-6">{doctors.length} total</span>
          <button className="btn btn-info btn-sm text-white" onClick={() => setAddModal(true)}>
            <i className="bi bi-plus-circle me-1"></i>Add Doctor
          </button>
          <button className="btn btn-outline-info btn-sm" onClick={() => { setLoading(true); load(); }}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>
      </div>

      <div className="input-group mb-4 shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
        <input className="form-control border-start-0" placeholder="Search by name, speciality, or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><i className="bi bi-x"></i></button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
              <i className="bi bi-heart-pulse fs-1 text-muted"></i>
            </div>
            <h5 className="text-muted fw-semibold">No doctors found</h5>
            <p className="text-muted small mb-0">{search ? 'Try adjusting your search terms' : 'No doctors registered yet'}</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((doc) => {
            const specColor = getSpecColor(doc.speciality);
            return (
              <div className="col-md-6 col-xl-4" key={doc.doctorId}>
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14, overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
                     onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                     onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                  {/* Color accent bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${specColor}, ${specColor}88)` }} />
                  <div className="card-body p-3">
                    {/* Top: Avatar + Name + Speciality */}
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                           style={{ width: 52, height: 52, background: `${specColor}18`, color: specColor, fontWeight: 700, fontSize: '1.1rem' }}>
                        {doc.profilePhotoPath ? (
                          <img src={`/api/doctors/${doc.doctorId}/photo`} alt="" className="rounded-circle" style={{ width: 52, height: 52, objectFit: 'cover' }} />
                        ) : getInitials(doc.doctorName)}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="fw-bold mb-1 text-truncate" title={`Dr. ${doc.doctorName}`}>Dr. {doc.doctorName}</h6>
                        <span className="badge fw-medium" style={{ background: `${specColor}18`, color: specColor, fontSize: '0.72rem' }}>
                          {doc.speciality}
                        </span>
                      </div>
                      <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '0.8rem' }}>₹{doc.chargedPerVisit}</span>
                    </div>

                    {/* Info rows */}
                    <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.82rem' }}>
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-hospital me-2 text-info" style={{ width: 16 }}></i>
                        <span className="text-truncate">{doc.hospitalName || '—'}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-geo-alt me-2 text-danger" style={{ width: 16 }}></i>
                        <span className="text-truncate">{doc.location || '—'}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-envelope me-2 text-primary" style={{ width: 16 }}></i>
                        <span className="text-truncate">{doc.email}</span>
                      </div>
                      {doc.mobileNo && (
                        <div className="d-flex align-items-center text-muted">
                          <i className="bi bi-telephone me-2 text-success" style={{ width: 16 }}></i>
                          <span>{doc.mobileNo}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex gap-2 pt-2 border-top">
                      <OverlayTrigger placement="top" overlay={<Tooltip>View Profile</Tooltip>}>
                        <button className="btn btn-sm btn-outline-info flex-fill" onClick={() => setProfileModal({ show: true, doc })}>
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Edit Doctor</Tooltip>}>
                        <button className="btn btn-sm btn-outline-warning flex-fill" onClick={() => openEdit(doc)}>
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Availability</Tooltip>}>
                        <button className="btn btn-sm btn-outline-success" onClick={() => openAvail(doc)}>
                          <i className="bi bi-calendar-range"></i>
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>View Documents</Tooltip>}>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => viewDoctorDocs(doc)}>
                          <i className="bi bi-file-earmark-medical"></i>
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Remove Doctor</Tooltip>}>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setRemoveModal({ show: true, doc })}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </OverlayTrigger>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Profile Modal */}
      <Modal show={profileModal.show} onHide={() => setProfileModal({ show: false, doc: null })} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5"><i className="bi bi-person-badge me-2 text-info"></i>Doctor Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profileModal.doc && (() => {
            const d = profileModal.doc;
            const specColor = getSpecColor(d.speciality);
            return (
              <div>
                <div className="text-center mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                       style={{ width: 72, height: 72, background: `${specColor}18`, color: specColor, fontWeight: 700, fontSize: '1.4rem' }}>
                    {d.profilePhotoPath ? (
                      <img src={`/api/doctors/${d.doctorId}/photo`} alt="" className="rounded-circle" style={{ width: 72, height: 72, objectFit: 'cover' }} />
                    ) : getInitials(d.doctorName)}
                  </div>
                  <h5 className="fw-bold mb-1">Dr. {d.doctorName}</h5>
                  <span className="badge fw-medium" style={{ background: `${specColor}18`, color: specColor }}>{d.speciality}</span>
                </div>
                <div className="list-group list-group-flush">
                  {[
                    { icon: 'bi-hash', label: 'Doctor ID', value: `#${d.doctorId}` },
                    { icon: 'bi-hospital', label: 'Hospital', value: d.hospitalName || '—' },
                    { icon: 'bi-geo-alt', label: 'Location', value: d.location || '—' },
                    { icon: 'bi-envelope', label: 'Email', value: d.email },
                    { icon: 'bi-telephone', label: 'Mobile', value: d.mobileNo || '—' },
                    { icon: 'bi-cash-coin', label: 'Fee Per Visit', value: `₹${d.chargedPerVisit}` },
                  ].map((item, i) => (
                    <div key={i} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span className="text-muted small"><i className={`bi ${item.icon} me-2`}></i>{item.label}</span>
                      <span className="fw-medium small">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-primary" size="sm" onClick={() => { openEdit(profileModal.doc); setProfileModal({ show: false, doc: null }); }}>
            <i className="bi bi-pencil me-1"></i>Edit
          </Button>
          <Button variant="outline-success" size="sm" onClick={() => { openAvail(profileModal.doc); setProfileModal({ show: false, doc: null }); }}>
            <i className="bi bi-calendar-range me-1"></i>Availability
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setProfileModal({ show: false, doc: null })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal show={removeModal.show} onHide={() => setRemoveModal({ show: false, doc: null })} centered size="sm">
        <Modal.Body className="text-center py-4">
          <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
               style={{ width: 64, height: 64 }}>
            <i className="bi bi-exclamation-triangle text-danger fs-3"></i>
          </div>
          <h5 className="fw-bold">Remove Doctor?</h5>
          <p className="text-muted small mb-0">
            Are you sure you want to remove <strong>Dr. {removeModal.doc?.doctorName}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setRemoveModal({ show: false, doc: null })}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleRemove}><i className="bi bi-trash me-1"></i>Yes, Remove</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, doc: null })} centered size="lg">
        <Modal.Header closeButton className="bg-warning bg-opacity-10">
          <Modal.Title><i className="bi bi-pencil-square me-2 text-warning"></i>Edit Doctor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input className="form-control" value={editForm.doctorName || ''} onChange={(e) => setEditForm({ ...editForm, doctorName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Speciality</label>
              <input className="form-control" value={editForm.speciality || ''} onChange={(e) => setEditForm({ ...editForm, speciality: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Hospital</label>
              <input className="form-control" value={editForm.hospitalName || ''} onChange={(e) => setEditForm({ ...editForm, hospitalName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Location</label>
              <input className="form-control" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mobile</label>
              <input className="form-control" value={editForm.mobileNo || ''} onChange={(e) => setEditForm({ ...editForm, mobileNo: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Charge Per Visit (₹)</label>
              <input className="form-control" type="number" value={editForm.chargedPerVisit || ''} onChange={(e) => setEditForm({ ...editForm, chargedPerVisit: parseFloat(e.target.value) })} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal({ show: false, doc: null })}>Cancel</Button>
          <Button variant="warning" onClick={handleSave}><i className="bi bi-check-lg me-1"></i>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Availability Modal */}
      <Modal show={availModal.show} onHide={() => setAvailModal({ show: false, doc: null, dates: [] })} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Availability — Dr. {availModal.doc?.doctorName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {availModal.dates.length === 0 ? (
            <div className="text-center text-muted py-4">
              <i className="bi bi-calendar-x fs-3 d-block mb-2"></i>
              No availability dates set
            </div>
          ) : (
            <div className="list-group list-group-flush mb-3">
              {availModal.dates.map((d) => (
                <div key={d.availabilityId} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-calendar-check text-success me-2"></i>
                    <span className="fw-medium">{format(new Date(d.fromDate), 'MMM dd, yyyy')}</span>
                    <span className="text-muted mx-2">→</span>
                    <span className="fw-medium">{format(new Date(d.endDate), 'MMM dd, yyyy')}</span>
                    {new Date(d.endDate) >= new Date() ? (
                      <span className="badge bg-success ms-2">Active</span>
                    ) : (
                      <span className="badge bg-secondary ms-2">Expired</span>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-warning" onClick={() => openEditAvail(d)}>
                      <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAvail(d)}>
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <hr />
          <h6 className="fw-semibold mb-3"><i className="bi bi-plus-circle me-2"></i>Add New Availability</h6>
          <form onSubmit={handleAddAvail} className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={addAvailForm.fromDate} onChange={(e) => setAddAvailForm({ ...addAvailForm, fromDate: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={addAvailForm.endDate} onChange={(e) => setAddAvailForm({ ...addAvailForm, endDate: e.target.value })} min={addAvailForm.fromDate} required />
            </div>
            <div className="col-md-4">
              <button type="submit" className="btn btn-info text-white w-100"><i className="bi bi-plus-circle me-1"></i>Add</button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAvailModal({ show: false, doc: null, dates: [] })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Availability Modal */}
      <Modal show={editAvailModal.show} onHide={() => setEditAvailModal({ show: false, item: null })} centered>
        <Modal.Header closeButton className="bg-warning bg-opacity-10">
          <Modal.Title><i className="bi bi-pencil-square me-2"></i>Edit Availability</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">From Date</Form.Label>
              <Form.Control type="date" value={editAvailForm.fromDate} onChange={(e) => setEditAvailForm({ ...editAvailForm, fromDate: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-medium">End Date</Form.Label>
              <Form.Control type="date" value={editAvailForm.endDate} onChange={(e) => setEditAvailForm({ ...editAvailForm, endDate: e.target.value })} min={editAvailForm.fromDate} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditAvailModal({ show: false, item: null })}>Cancel</Button>
          <Button variant="warning" onClick={handleEditAvailSave}><i className="bi bi-check-lg me-1"></i>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Doctor Documents Modal */}
      <Modal show={docsModal.show} onHide={() => setDocsModal({ show: false, doctorName: '', docs: [], loading: false })} centered size="lg">
        <Modal.Header closeButton className="bg-primary bg-opacity-10">
          <Modal.Title className="fs-5"><i className="bi bi-file-earmark-medical me-2 text-primary"></i>Documents — Dr. {docsModal.doctorName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {docsModal.loading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          ) : docsModal.docs.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-folder2-open fs-1 d-block mb-2"></i>No documents found
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {docsModal.docs.map((d) => (
                <div key={d.documentId} className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, minWidth: 40 }}>
                      <i className={`bi ${d.fileType?.includes('pdf') ? 'bi-file-earmark-pdf text-danger' : d.fileType?.includes('image') ? 'bi-file-earmark-image text-success' : 'bi-file-earmark text-primary'}`}></i>
                    </div>
                    <div>
                      <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{d.fileName}</div>
                      <div className="d-flex gap-2" style={{ fontSize: '0.78rem', color: '#6b7c93' }}>
                        {d.fileType && <span>{d.fileType}</span>}
                        {d.uploadDate && <span>{new Date(d.uploadDate).toLocaleDateString()}</span>}
                      </div>
                      {d.description && <small className="text-muted">{d.description}</small>}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadDoc(d)}>
                    <i className="bi bi-download me-1"></i>Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDocsModal({ show: false, doctorName: '', docs: [], loading: false })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal show={addModal} onHide={() => setAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-info bg-opacity-10">
          <Modal.Title><i className="bi bi-plus-circle me-2 text-info"></i>Add New Doctor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Username <span className="text-danger">*</span></label>
              <input className="form-control" placeholder="Alphanumeric only" value={addForm.userName} onChange={(e) => setAddForm({ ...addForm, userName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Email <span className="text-danger">*</span></label>
              <input className="form-control" type="email" placeholder="doctor@example.com" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Password <span className="text-danger">*</span></label>
              <input className="form-control" type="password" placeholder="8-20 chars, upper, lower, digit, special" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Confirm Password <span className="text-danger">*</span></label>
              <input className="form-control" type="password" placeholder="Re-enter password" value={addForm.confirmPassword} onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Doctor Name <span className="text-danger">*</span></label>
              <input className="form-control" placeholder="Full name" value={addForm.doctorName} onChange={(e) => setAddForm({ ...addForm, doctorName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Speciality <span className="text-danger">*</span></label>
              <SpecializationSelect value={addForm.speciality} onChange={(e) => setAddForm({ ...addForm, speciality: e.target.value })} required />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Hospital Name</label>
              <input className="form-control" placeholder="Hospital name" value={addForm.hospitalName} onChange={(e) => setAddForm({ ...addForm, hospitalName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Location</label>
              <input className="form-control" placeholder="Clinic/hospital location" value={addForm.location} onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium">City</label>
              <CitySelect value={addForm.city} onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium">Mobile No</label>
              <input className="form-control" placeholder="Phone number" value={addForm.mobileNo} onChange={(e) => setAddForm({ ...addForm, mobileNo: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium">Charge Per Visit (₹)</label>
              <input className="form-control" type="number" placeholder="500" value={addForm.chargedPerVisit} onChange={(e) => setAddForm({ ...addForm, chargedPerVisit: parseFloat(e.target.value) || '' })} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
          <Button variant="info" className="text-white" onClick={handleAddDoctor} disabled={addLoading}>
            {addLoading ? <><span className="spinner-border spinner-border-sm me-2" />Adding...</> : <><i className="bi bi-plus-circle me-1"></i>Add Doctor</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
