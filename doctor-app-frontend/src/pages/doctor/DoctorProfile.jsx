import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDoctorById, updateDoctor, uploadDoctorPhoto, uploadDoctorDocument, getDocumentsByDoctor, downloadDocument, deleteDocument } from '../../services/api';
import CitySelect from '../../components/CitySelect';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docDescription, setDocDescription] = useState('');

  useEffect(() => { loadProfile(); loadDocuments(); }, []);

  const loadProfile = async () => {
    try {
      const res = await getDoctorById(user.profileId);
      const data = res.data.data;
      setProfile(data);
      setForm(data);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await updateDoctor(form);
      toast.success('Profile updated!');
      setProfile(form);
      setEditing(false);
    } catch {
      toast.error('Failed to update');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be less than 2MB');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadDoctorPhoto(user.profileId, formData);
      const photoUrl = res.data.data;
      setProfile({ ...profile, profilePhoto: photoUrl });
      setForm({ ...form, profilePhoto: photoUrl });
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await getDocumentsByDoctor(user.profileId);
      setDocuments(res.data.data || []);
    } catch { /* ignore */ }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be less than 10MB');
      return;
    }
    setDocUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doctorId', user.profileId);
      if (docDescription.trim()) formData.append('description', docDescription.trim());
      await uploadDoctorDocument(formData);
      toast.success('Document uploaded!');
      setDocDescription('');
      loadDocuments();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setDocUploading(false);
    }
  };

  const handleDocDownload = async (doc) => {
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
      toast.error('Failed to download');
    }
  };

  const handleDocDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      toast.success('Document deleted');
      loadDocuments();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return 'bi-file-earmark';
    if (fileType.includes('pdf')) return 'bi-file-earmark-pdf-fill';
    if (fileType.includes('image')) return 'bi-file-earmark-image-fill';
    if (fileType.includes('word') || fileType.includes('document')) return 'bi-file-earmark-word-fill';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'bi-file-earmark-excel-fill';
    return 'bi-file-earmark-fill';
  };

  const getFileColor = (fileType) => {
    if (!fileType) return '#6b7c93';
    if (fileType.includes('pdf')) return '#dc3545';
    if (fileType.includes('image')) return '#1B6EB5';
    if (fileType.includes('word')) return '#0d6efd';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '#198754';
    return '#6b7c93';
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border" style={{ color: '#1B6EB5' }} /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>
          <span className="d-inline-flex align-items-center justify-content-center me-2" style={{ width: 38, height: 38, borderRadius: '50%', background: '#e8f0fe' }}>
            <i className="bi bi-person-circle" style={{ color: '#1B6EB5', fontSize: '1rem' }}></i>
          </span>
          My Profile
        </h4>
        <button
          className="btn btn-sm px-3"
          style={editing
            ? { background: '#f0f0f0', color: '#6b7c93', border: '1px solid #d0d5dd', borderRadius: 8 }
            : { background: '#1B6EB5', color: '#fff', border: 'none', borderRadius: 8 }}
          onClick={() => setEditing(!editing)}
        >
          <i className={`bi ${editing ? 'bi-x-lg' : 'bi-pencil'} me-1`}></i>{editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          {/* Profile avatar header */}
          <div className="d-flex align-items-center mb-4 pb-3" style={{ borderBottom: '1px solid #e8eef3' }}>
            <div className="position-relative me-3">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1B6EB5' }} />
              ) : (
                <div className="d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8f0fe', border: '2px solid #1B6EB5' }}>
                  <i className="bi bi-person-fill fs-3" style={{ color: '#1B6EB5' }}></i>
                </div>
              )}
              <label className="position-absolute d-flex align-items-center justify-content-center"
                style={{ bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: '#1B6EB5', cursor: 'pointer', border: '2px solid #fff' }}>
                {uploading ? (
                  <span className="spinner-border spinner-border-sm text-white" style={{ width: 12, height: 12 }} />
                ) : (
                  <i className="bi bi-camera-fill text-white" style={{ fontSize: '0.65rem' }}></i>
                )}
                <input type="file" accept="image/*" className="d-none" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
            <div>
              <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>{profile?.doctorName}</h5>
              <span className="badge px-3 py-1" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 20, fontSize: '0.8rem' }}>
                {profile?.speciality || 'Doctor'}
              </span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Full Name</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.doctorName || ''} disabled={!editing} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Email</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.email || ''} disabled={!editing} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Speciality</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.speciality || ''} disabled={!editing} onChange={(e) => setForm({ ...form, speciality: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Hospital</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.hospitalName || ''} disabled={!editing} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Address</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.location || ''} disabled={!editing} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Mobile</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.mobileNo || ''} disabled={!editing} onChange={(e) => setForm({ ...form, mobileNo: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Charge Per Visit (₹)</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} type="number" value={form.chargedPerVisit || ''} disabled={!editing} onChange={(e) => setForm({ ...form, chargedPerVisit: parseFloat(e.target.value) })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>City</label>
              {editing ? (
                <CitySelect value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              ) : (
                <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.city || ''} disabled />
              )}
            </div>
          </div>
          {editing && (
            <button className="btn mt-4 px-4 fw-semibold" style={{ background: '#1B6EB5', color: '#fff', border: 'none', borderRadius: 8 }} onClick={handleSave}>
              <i className="bi bi-check-lg me-1"></i>Save Changes
            </button>
          )}
        </div>
      </div>

      {/* My Documents Section */}
      <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>
              <i className="bi bi-folder2-open me-2" style={{ color: '#1B6EB5' }}></i>
              My Documents
            </h5>
            <span className="badge px-3 py-1" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 20 }}>
              {documents.length} file{documents.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Upload Section */}
          <div className="p-3 mb-3" style={{ background: '#f8fafc', borderRadius: 10, border: '1px dashed #c8d6e5' }}>
            <div className="row g-2 align-items-end">
              <div className="col-md-5">
                <label className="form-label fw-medium mb-1" style={{ color: '#6b7c93', fontSize: '0.8rem' }}>Description (optional)</label>
                <input
                  className="form-control form-control-sm"
                  style={{ borderColor: '#e0e6ed', borderRadius: 8 }}
                  placeholder="e.g., License, Certificate..."
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <label
                  className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ background: '#1B6EB5', color: '#fff', border: 'none', borderRadius: 8, height: 31 }}
                >
                  {docUploading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up"></i>
                      Choose & Upload File
                    </>
                  )}
                  <input type="file" className="d-none" onChange={handleDocUpload} disabled={docUploading} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" />
                </label>
              </div>
              <div className="col-md-3">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>Max 10MB • PDF, DOC, IMG, XLS</small>
              </div>
            </div>
          </div>

          {/* Document List */}
          {documents.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-x fs-1" style={{ color: '#c8d6e5' }}></i>
              <p className="mt-2 mb-0" style={{ color: '#6b7c93' }}>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {documents.map((doc) => (
                <div key={doc.documentId} className="d-flex align-items-center p-3" style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8eef3' }}>
                  <div className="d-flex align-items-center justify-content-center me-3" style={{ width: 40, height: 40, borderRadius: 10, background: '#f0f4f8' }}>
                    <i className={`bi ${getFileIcon(doc.fileType)}`} style={{ fontSize: '1.2rem', color: getFileColor(doc.fileType) }}></i>
                  </div>
                  <div className="flex-grow-1 me-3" style={{ minWidth: 0 }}>
                    <div className="fw-medium text-truncate" style={{ color: '#1a1a2e', fontSize: '0.9rem' }}>{doc.fileName}</div>
                    <div style={{ color: '#6b7c93', fontSize: '0.75rem' }}>
                      {doc.description && <span className="me-2">{doc.description}</span>}
                      {doc.uploadDate && new Date(doc.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm px-2" style={{ background: '#e8f0fe', color: '#1B6EB5', border: 'none', borderRadius: 8 }} onClick={() => handleDocDownload(doc)} title="Download">
                      <i className="bi bi-download"></i>
                    </button>
                    <button className="btn btn-sm px-2" style={{ background: '#fde8e8', color: '#dc3545', border: 'none', borderRadius: 8 }} onClick={() => handleDocDelete(doc.documentId)} title="Delete">
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
