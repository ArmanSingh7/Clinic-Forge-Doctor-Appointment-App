import { useEffect, useState } from 'react';
import { getAllPatients, removePatient, updatePatient, registerPatient, getDocumentsByPatient, downloadDocument } from '../../services/api';
import { Modal, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import toast from 'react-hot-toast';

const GENDER_ICONS = { Male: 'bi-gender-male', Female: 'bi-gender-female', Other: 'bi-gender-ambiguous' };
const GENDER_COLORS = { Male: '#0d6efd', Female: '#d63384', Other: '#6f42c1' };
const BLOOD_COLORS = { 'A+': '#dc3545', 'A-': '#dc3545', 'B+': '#fd7e14', 'B-': '#fd7e14', 'AB+': '#6f42c1', 'AB-': '#6f42c1', 'O+': '#198754', 'O-': '#198754' };

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileModal, setProfileModal] = useState({ show: false, pat: null });
  const [removeModal, setRemoveModal] = useState({ show: false, pat: null });
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ userName: '', password: '', confirmPassword: '', patientName: '', mobileNo: '', email: '', bloodGroup: '', gender: '', age: '', address: '', city: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [docsModal, setDocsModal] = useState({ show: false, patientName: '', docs: [], loading: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getAllPatients();
      setPatients(res.data.data || []);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    const pat = removeModal.pat;
    if (!pat) return;
    try {
      await removePatient(pat);
      toast.success('Patient removed');
      setRemoveModal({ show: false, pat: null });
      load();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const openEdit = (pat) => {
    setEditForm({ ...pat });
    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await updatePatient(editForm);
      toast.success('Patient updated');
      setShowEdit(false);
      load();
    } catch {
      toast.error('Failed to update patient');
    }
  };

  const getInitials = (name) => (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const getGenderColor = (gender) => GENDER_COLORS[gender] || '#6b7c93';

  const handleAddPatient = async () => {
    if (!addForm.userName || !addForm.password || !addForm.confirmPassword || !addForm.patientName || !addForm.email) {
      toast.error('Please fill all required fields');
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setAddLoading(true);
    try {
      await registerPatient(addForm);
      toast.success('Patient added successfully!');
      setAddModal(false);
      setAddForm({ userName: '', password: '', confirmPassword: '', patientName: '', mobileNo: '', email: '', bloodGroup: '', gender: '', age: '', address: '', city: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.fieldErrors ? Object.values(err.response.data.fieldErrors).join(', ') : 'Failed to add patient');
    } finally {
      setAddLoading(false);
    }
  };

  const viewDocuments = async (pat) => {
    setDocsModal({ show: true, patientName: pat.patientName, docs: [], loading: true });
    try {
      const res = await getDocumentsByPatient(pat.patientId);
      setDocsModal({ show: true, patientName: pat.patientName, docs: res.data.data || [], loading: false });
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

  const filtered = patients.filter(
    (p) =>
      p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.mobileNo?.includes(search)
  );

  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: 400 }}>
      <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }} />
      <p className="text-muted">Loading patients...</p>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-people me-2 text-info"></i>Manage Patients</h4>
          <p className="text-muted mb-0 small">View and manage all registered patients</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-info bg-opacity-10 text-info px-3 py-2 fs-6">{patients.length} total</span>
          <button className="btn btn-info btn-sm text-white" onClick={() => setAddModal(true)}>
            <i className="bi bi-plus-circle me-1"></i>Add Patient
          </button>
          <button className="btn btn-outline-info btn-sm" onClick={() => { setLoading(true); load(); }}>
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>
      </div>

      <div className="input-group mb-4 shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
        <input className="form-control border-start-0" placeholder="Search by name, email, or mobile..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && (
          <button className="btn btn-outline-secondary" onClick={() => setSearch('')}><i className="bi bi-x"></i></button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
              <i className="bi bi-people fs-1 text-muted"></i>
            </div>
            <h5 className="text-muted fw-semibold">No patients found</h5>
            <p className="text-muted small mb-0">{search ? 'Try adjusting your search terms' : 'No patients registered yet'}</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((pat) => {
            const gColor = getGenderColor(pat.gender);
            const bColor = BLOOD_COLORS[pat.bloodGroup] || '#6b7c93';
            return (
              <div className="col-md-6 col-xl-4" key={pat.patientId}>
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14, overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
                     onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'; }}
                     onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                  {/* Color accent bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${gColor}, ${gColor}88)` }} />
                  <div className="card-body p-3">
                    {/* Top: Avatar + Name + Blood Group */}
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                           style={{ width: 52, height: 52, background: `${gColor}18`, color: gColor, fontWeight: 700, fontSize: '1.1rem' }}>
                        {pat.profilePhotoPath ? (
                          <img src={`/api/patients/${pat.patientId}/photo`} alt="" className="rounded-circle" style={{ width: 52, height: 52, objectFit: 'cover' }} />
                        ) : getInitials(pat.patientName)}
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <h6 className="fw-bold mb-1 text-truncate" title={pat.patientName}>{pat.patientName}</h6>
                        <div className="d-flex gap-2 align-items-center">
                          {pat.gender && (
                            <span className="badge fw-medium" style={{ background: `${gColor}18`, color: gColor, fontSize: '0.7rem' }}>
                              <i className={`bi ${GENDER_ICONS[pat.gender] || 'bi-person'} me-1`}></i>{pat.gender}
                            </span>
                          )}
                          {pat.age && <span className="text-muted" style={{ fontSize: '0.75rem' }}>Age {pat.age}</span>}
                        </div>
                      </div>
                      {pat.bloodGroup && (
                        <span className="badge fw-bold" style={{ background: `${bColor}15`, color: bColor, fontSize: '0.85rem', borderRadius: 8, padding: '4px 10px' }}>
                          {pat.bloodGroup}
                        </span>
                      )}
                    </div>

                    {/* Info rows */}
                    <div className="d-flex flex-column gap-2 mb-3" style={{ fontSize: '0.82rem' }}>
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-envelope me-2 text-primary" style={{ width: 16 }}></i>
                        <span className="text-truncate">{pat.email}</span>
                      </div>
                      {pat.mobileNo && (
                        <div className="d-flex align-items-center text-muted">
                          <i className="bi bi-telephone me-2 text-success" style={{ width: 16 }}></i>
                          <span>{pat.mobileNo}</span>
                        </div>
                      )}
                      {pat.address && (
                        <div className="d-flex align-items-center text-muted">
                          <i className="bi bi-house me-2 text-info" style={{ width: 16 }}></i>
                          <span className="text-truncate">{pat.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="d-flex gap-2 pt-2 border-top">
                      <OverlayTrigger placement="top" overlay={<Tooltip>View Profile</Tooltip>}>
                        <button className="btn btn-sm btn-outline-info flex-fill" onClick={() => setProfileModal({ show: true, pat })}>
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Edit Patient</Tooltip>}>
                        <button className="btn btn-sm btn-outline-warning flex-fill" onClick={() => openEdit(pat)}>
                          <i className="bi bi-pencil me-1"></i>Edit
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>View Documents</Tooltip>}>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => viewDocuments(pat)}>
                          <i className="bi bi-file-earmark-medical"></i>
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Remove Patient</Tooltip>}>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setRemoveModal({ show: true, pat })}>
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
      <Modal show={profileModal.show} onHide={() => setProfileModal({ show: false, pat: null })} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-5"><i className="bi bi-person-badge me-2 text-info"></i>Patient Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profileModal.pat && (() => {
            const p = profileModal.pat;
            const gColor = getGenderColor(p.gender);
            return (
              <div>
                <div className="text-center mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                       style={{ width: 72, height: 72, background: `${gColor}18`, color: gColor, fontWeight: 700, fontSize: '1.4rem' }}>
                    {p.profilePhotoPath ? (
                      <img src={`/api/patients/${p.patientId}/photo`} alt="" className="rounded-circle" style={{ width: 72, height: 72, objectFit: 'cover' }} />
                    ) : getInitials(p.patientName)}
                  </div>
                  <h5 className="fw-bold mb-1">{p.patientName}</h5>
                  <div className="d-flex justify-content-center gap-2">
                    {p.gender && (
                      <span className="badge" style={{ background: `${gColor}18`, color: gColor }}>{p.gender}</span>
                    )}
                    {p.bloodGroup && (
                      <span className="badge" style={{ background: `${BLOOD_COLORS[p.bloodGroup] || '#6b7c93'}15`, color: BLOOD_COLORS[p.bloodGroup] || '#6b7c93' }}>{p.bloodGroup}</span>
                    )}
                  </div>
                </div>
                <div className="list-group list-group-flush">
                  {[
                    { icon: 'bi-hash', label: 'Patient ID', value: `#${p.patientId}` },
                    { icon: 'bi-envelope', label: 'Email', value: p.email },
                    { icon: 'bi-telephone', label: 'Mobile', value: p.mobileNo || '—' },
                    { icon: 'bi-calendar3', label: 'Age', value: p.age ? `${p.age} years` : '—' },
                    { icon: 'bi-droplet', label: 'Blood Group', value: p.bloodGroup || '—' },
                    { icon: 'bi-house', label: 'Address', value: p.address || '—' },
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
          <Button variant="outline-warning" size="sm" onClick={() => { openEdit(profileModal.pat); setProfileModal({ show: false, pat: null }); }}>
            <i className="bi bi-pencil me-1"></i>Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setProfileModal({ show: false, pat: null })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal show={removeModal.show} onHide={() => setRemoveModal({ show: false, pat: null })} centered size="sm">
        <Modal.Body className="text-center py-4">
          <div className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
               style={{ width: 64, height: 64 }}>
            <i className="bi bi-exclamation-triangle text-danger fs-3"></i>
          </div>
          <h5 className="fw-bold">Remove Patient?</h5>
          <p className="text-muted small mb-0">
            Are you sure you want to remove <strong>{removeModal.pat?.patientName}</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <Button variant="outline-secondary" size="sm" onClick={() => setRemoveModal({ show: false, pat: null })}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleRemove}><i className="bi bi-trash me-1"></i>Yes, Remove</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton className="bg-warning bg-opacity-10">
          <Modal.Title><i className="bi bi-pencil-square me-2"></i>Edit Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="patientName" value={editForm.patientName || ''} onChange={handleEditChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" value={editForm.email || ''} onChange={handleEditChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile No</Form.Label>
              <Form.Control name="mobileNo" value={editForm.mobileNo || ''} onChange={handleEditChange} />
            </Form.Group>
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Age</Form.Label>
                  <Form.Control name="age" type="number" value={editForm.age || ''} onChange={handleEditChange} />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select name="gender" value={editForm.gender || ''} onChange={handleEditChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select name="bloodGroup" value={editForm.bloodGroup || ''} onChange={handleEditChange}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control as="textarea" rows={2} name="address" value={editForm.address || ''} onChange={handleEditChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleEditSave}><i className="bi bi-check-lg me-1"></i>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Documents Modal */}
      <Modal show={docsModal.show} onHide={() => setDocsModal({ show: false, patientName: '', docs: [], loading: false })} centered size="lg">
        <Modal.Header closeButton className="bg-primary bg-opacity-10">
          <Modal.Title className="fs-5"><i className="bi bi-file-earmark-medical me-2 text-primary"></i>Documents — {docsModal.patientName}</Modal.Title>
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
              {docsModal.docs.map((doc) => (
                <div key={doc.documentId} className="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, minWidth: 40 }}>
                      <i className={`bi ${doc.fileType?.includes('pdf') ? 'bi-file-earmark-pdf text-danger' : doc.fileType?.includes('image') ? 'bi-file-earmark-image text-success' : 'bi-file-earmark text-primary'}`}></i>
                    </div>
                    <div>
                      <div className="fw-medium" style={{ fontSize: '0.9rem' }}>{doc.fileName}</div>
                      <div className="d-flex gap-2" style={{ fontSize: '0.78rem', color: '#6b7c93' }}>
                        {doc.fileType && <span>{doc.fileType}</span>}
                        {doc.uploadDate && <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>}
                      </div>
                      {doc.description && <small className="text-muted">{doc.description}</small>}
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownloadDoc(doc)}>
                    <i className="bi bi-download me-1"></i>Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDocsModal({ show: false, patientName: '', docs: [], loading: false })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Add Patient Modal */}
      <Modal show={addModal} onHide={() => setAddModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-info bg-opacity-10">
          <Modal.Title><i className="bi bi-plus-circle me-2 text-info"></i>Add New Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">Username <span className="text-danger">*</span></label>
              <input className="form-control" placeholder="Alphanumeric only" value={addForm.userName} onChange={(e) => setAddForm({ ...addForm, userName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Email <span className="text-danger">*</span></label>
              <input className="form-control" type="email" placeholder="patient@example.com" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
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
              <label className="form-label fw-medium">Patient Name <span className="text-danger">*</span></label>
              <input className="form-control" placeholder="Full name" value={addForm.patientName} onChange={(e) => setAddForm({ ...addForm, patientName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Mobile No</label>
              <input className="form-control" placeholder="Phone number" value={addForm.mobileNo} onChange={(e) => setAddForm({ ...addForm, mobileNo: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium">Age</label>
              <input className="form-control" type="number" placeholder="Age" value={addForm.age} onChange={(e) => setAddForm({ ...addForm, age: parseInt(e.target.value) || '' })} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium">Gender</label>
              <Form.Select value={addForm.gender} onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-medium">Blood Group</label>
              <Form.Select value={addForm.bloodGroup} onChange={(e) => setAddForm({ ...addForm, bloodGroup: e.target.value })}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">City</label>
              <input className="form-control" placeholder="City" value={addForm.city} onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">Address</label>
              <input className="form-control" placeholder="Address" value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
          <Button variant="info" className="text-white" onClick={handleAddPatient} disabled={addLoading}>
            {addLoading ? <><span className="spinner-border spinner-border-sm me-2" />Adding...</> : <><i className="bi bi-plus-circle me-1"></i>Add Patient</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
