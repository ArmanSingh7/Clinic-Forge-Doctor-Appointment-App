import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientsByDoctor, getPatientHistory, sendDoctorEmail, getDocumentsByPatient, downloadDocument } from '../../services/api';
import toast from 'react-hot-toast';
import { Modal, Button } from 'react-bootstrap';
import { format } from 'date-fns';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [historyModal, setHistoryModal] = useState({ show: false, data: null, loading: false });

  // Full profile modal
  const [profileModal, setProfileModal] = useState({ show: false, patient: null });

  // Email modal
  const [emailModal, setEmailModal] = useState({ show: false, to: '', patientName: '' });
  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Documents modal
  const [docsModal, setDocsModal] = useState({ show: false, patientName: '', docs: [], loading: false });

  useEffect(() => {
    getPatientsByDoctor(user.profileId)
      .then((res) => setPatients(res.data.data || []))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

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
        body: `Dear ${emailModal.patientName},\n\n${emailForm.body}\n\nRegards,\nDoctor`,
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

  const viewDocuments = async (patient) => {
    setDocsModal({ show: true, patientName: patient.patientName, docs: [], loading: true });
    try {
      const res = await getDocumentsByPatient(patient.patientId);
      setDocsModal({ show: true, patientName: patient.patientName, docs: res.data.data || [], loading: false });
    } catch {
      toast.error('Failed to load documents');
      setDocsModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDownload = async (doc) => {
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
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1B6EB5' }} /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>
          <span className="d-inline-flex align-items-center justify-content-center me-2" style={{ width: 38, height: 38, borderRadius: '50%', background: '#e8f0fe' }}>
            <i className="bi bi-people-fill" style={{ color: '#1B6EB5', fontSize: '1rem' }}></i>
          </span>
          My Patients
        </h4>
        <span className="badge px-3 py-2 fw-semibold" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 20 }}>
          {patients.length} Total
        </span>
      </div>

      <div className="input-group mb-4" style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#e0e6ed' }}><i className="bi bi-search" style={{ color: '#6b7c93' }}></i></span>
        <input className="form-control border-start-0" style={{ borderColor: '#e0e6ed' }} placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-5" style={{ color: '#6b7c93' }}>
          <i className="bi bi-people fs-1 d-block mb-2"></i>No patients found
        </div>
      ) : (
        <div className="row g-3">
          {filtered.map((p) => (
            <div key={p.patientId} className="col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex align-items-center justify-content-center me-3" style={{ width: 44, height: 44, minWidth: 44, borderRadius: '50%', background: '#e8f0fe', border: '2px solid #1B6EB5', overflow: 'hidden' }}>
                      {p.profilePhoto ? (
                        <img src={p.profilePhoto} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <i className="bi bi-person fs-5" style={{ color: '#1B6EB5' }}></i>
                      )}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>{p.patientName}</h6>
                      <small style={{ color: '#6b7c93' }}>{p.email}</small>
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6"><small style={{ color: '#6b7c93' }}>Age:</small><div className="fw-medium" style={{ color: '#1a1a2e' }}>{p.age || '-'}</div></div>
                    <div className="col-6"><small style={{ color: '#6b7c93' }}>Gender:</small><div className="fw-medium" style={{ color: '#1a1a2e' }}>{p.gender || '-'}</div></div>
                    <div className="col-6"><small style={{ color: '#6b7c93' }}>Blood:</small><div className="fw-medium" style={{ color: '#1a1a2e' }}>{p.bloodGroup || '-'}</div></div>
                    <div className="col-6"><small style={{ color: '#6b7c93' }}>Mobile:</small><div className="fw-medium" style={{ color: '#1a1a2e' }}>{p.mobileNo || '-'}</div></div>
                  </div>
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <button className="btn btn-sm flex-fill" style={{ background: '#1B6EB5', color: '#fff', borderRadius: 6 }} onClick={() => setProfileModal({ show: true, patient: p })}>
                      <i className="bi bi-person-vcard me-1"></i>Full Profile
                    </button>
                    <button className="btn btn-sm flex-fill" style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 6 }}
                      onClick={() => { setEmailModal({ show: true, to: p.email || '', patientName: p.patientName }); setEmailForm({ subject: '', body: '' }); }}>
                      <i className="bi bi-envelope me-1"></i>Message
                    </button>
                    <button className="btn btn-sm" style={{ background: '#fff3cd', color: '#856404', border: '1px solid #ffc107', borderRadius: 6 }} onClick={() => viewDocuments(p)}>
                      <i className="bi bi-file-earmark-medical me-1"></i>Docs
                    </button>
                    <button className="btn btn-sm" style={{ background: '#fff', color: '#6b7c93', border: '1px solid #e0e6ed', borderRadius: 6 }} onClick={() => viewHistory(p)}>
                      <i className="bi bi-clock-history me-1"></i>History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <div className="text-center py-4" style={{ color: '#6b7c93' }}>
                  <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>No visit records
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {historyModal.data.visits.map((v, i) => (
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
                      {v.medicines && v.medicines.length > 0 && (
                        <div className="mt-2">
                          <small className="fw-medium" style={{ color: '#1B6EB5' }}><i className="bi bi-capsule me-1"></i>Prescribed:</small>
                          <ul className="mb-0 ps-3 mt-1">
                            {v.medicines.map((m) => (
                              <li key={m.medicineId}>
                                <small><strong style={{ color: '#1a1a2e' }}>{m.medicineName}</strong> — {m.dosage} | {m.frequency} | {m.duration}</small>
                              </li>
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setHistoryModal({ show: false, data: null, loading: false })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Full Profile Modal */}
      <Modal show={profileModal.show} onHide={() => setProfileModal({ show: false, patient: null })} centered>
        <Modal.Header closeButton style={{ background: '#e8f0fe', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: '#1B6EB5', fontSize: '1.1rem' }}>
            <i className="bi bi-person-vcard me-2"></i>Patient Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {profileModal.patient && (() => {
            const p = profileModal.patient;
            return (
              <>
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
                    style={{ width: 80, height: 80, background: '#e8f0fe', border: '3px solid #1B6EB5', overflow: 'hidden' }}>
                    {p.profilePhoto ? (
                      <img src={p.profilePhoto} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <i className="bi bi-person-fill fs-1" style={{ color: '#1B6EB5' }}></i>
                    )}
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: '#1B6EB5' }}>{p.patientName}</h5>
                  <small style={{ color: '#6b7c93' }}>{p.email}</small>
                </div>
                <div className="row g-3">
                  {[
                    { icon: 'bi-person', label: 'Age', value: p.age || '-' },
                    { icon: 'bi-gender-ambiguous', label: 'Gender', value: p.gender || '-' },
                    { icon: 'bi-droplet', label: 'Blood Group', value: p.bloodGroup || '-' },
                    { icon: 'bi-phone', label: 'Mobile', value: p.mobileNo || '-' },
                    { icon: 'bi-geo-alt', label: 'City', value: p.city || '-' },
                    { icon: 'bi-house', label: 'Address', value: p.address || '-' },
                    { icon: 'bi-envelope', label: 'Email', value: p.email || '-' },
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
              </>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProfileModal({ show: false, patient: null })}>Close</Button>
          {profileModal.patient && (
            <>
              <Button style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5' }}
                onClick={() => { setProfileModal({ show: false, patient: null }); viewHistory(profileModal.patient); }}>
                <i className="bi bi-clock-history me-1"></i>History
              </Button>
              <Button style={{ background: '#1B6EB5', border: 'none' }}
                onClick={() => {
                  setProfileModal({ show: false, patient: null });
                  setEmailModal({ show: true, to: profileModal.patient.email || '', patientName: profileModal.patient.patientName });
                  setEmailForm({ subject: '', body: '' });
                }}>
                <i className="bi bi-envelope me-1"></i>Send Message
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Email Modal */}
      <Modal show={emailModal.show} onHide={() => setEmailModal({ show: false, to: '', patientName: '' })} centered>
        <Modal.Header closeButton style={{ background: '#e8f0fe', borderBottom: '1px solid #d0dce8' }}>
          <Modal.Title style={{ color: '#1B6EB5', fontSize: '1.1rem' }}>
            <i className="bi bi-envelope me-2"></i>Send Message to {emailModal.patientName}
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

      {/* Documents Modal */}
      <Modal show={docsModal.show} onHide={() => setDocsModal({ show: false, patientName: '', docs: [], loading: false })} centered size="lg">
        <Modal.Header closeButton style={{ background: '#fff3cd', borderBottom: '1px solid #ffc107' }}>
          <Modal.Title style={{ color: '#856404', fontSize: '1.1rem' }}>
            <i className="bi bi-file-earmark-medical me-2"></i>Documents — {docsModal.patientName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {docsModal.loading ? (
            <div className="text-center py-4"><div className="spinner-border" style={{ color: '#1B6EB5' }} /></div>
          ) : docsModal.docs.length === 0 ? (
            <div className="text-center py-4" style={{ color: '#6b7c93' }}>
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
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleDownload(doc)}>
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
    </div>
  );
}
