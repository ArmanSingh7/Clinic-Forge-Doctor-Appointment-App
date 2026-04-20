import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientById, updatePatient, getDocumentsByPatient, uploadDocument, downloadDocument, deleteDocument, uploadPatientPhoto } from '../../services/api';
import CitySelect from '../../components/CitySelect';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => { loadProfile(); loadDocuments(); }, []);

  const loadProfile = async () => {
    try {
      const res = await getPatientById(user.profileId);
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
      await updatePatient(form);
      toast.success('Profile updated!');
      setProfile(form);
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be less than 2MB');
      return;
    }
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadPatientPhoto(user.profileId, fd);
      const photoUrl = res.data.data;
      setProfile({ ...profile, profilePhoto: photoUrl });
      setForm({ ...form, profilePhoto: photoUrl });
      toast.success('Photo uploaded!');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await getDocumentsByPatient(user.profileId);
      setDocuments(res.data.data || []);
    } catch { /* ignore */ }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', user.profileId);
      await uploadDocument(formData);
      toast.success('Document uploaded!');
      loadDocuments();
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
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
      toast.error('Failed to download');
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      toast.success('Document deleted');
      loadDocuments();
    } catch {
      toast.error('Failed to delete');
    }
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
          <i className={`bi ${editing ? 'bi-x-lg' : 'bi-pencil'} me-1`}></i>
          {editing ? 'Cancel' : 'Edit'}
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
                {uploadingPhoto ? (
                  <span className="spinner-border spinner-border-sm text-white" style={{ width: 12, height: 12 }} />
                ) : (
                  <i className="bi bi-camera-fill text-white" style={{ fontSize: '0.65rem' }}></i>
                )}
                <input type="file" accept="image/*" className="d-none" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
              </label>
            </div>
            <div>
              <h5 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>{profile?.patientName}</h5>
              <span className="badge px-3 py-1" style={{ background: '#e8f0fe', color: '#1B6EB5', borderRadius: 20, fontSize: '0.8rem' }}>
                {profile?.bloodGroup || 'Patient'}
              </span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Full Name</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.patientName || ''} disabled={!editing} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Email</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.email || ''} disabled={!editing} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Mobile</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.mobileNo || ''} disabled={!editing} onChange={(e) => setForm({ ...form, mobileNo: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Age</label>
              <input className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} type="number" value={form.age || ''} disabled={!editing} onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) })} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Gender</label>
              <select className="form-select" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.gender || ''} disabled={!editing} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Blood Group</label>
              <select className="form-select" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} value={form.bloodGroup || ''} disabled={!editing} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-medium" style={{ color: '#6b7c93', fontSize: '0.85rem' }}>Address</label>
              <textarea className="form-control" style={{ borderColor: '#e0e6ed', borderRadius: 8 }} rows="2" value={form.address || ''} disabled={!editing} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
      <h5 className="fw-bold mt-5 mb-3" style={{ color: '#1a1a2e' }}>
        <span className="d-inline-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32, borderRadius: '50%', background: '#e8f0fe' }}>
          <i className="bi bi-file-earmark-medical" style={{ color: '#1B6EB5', fontSize: '0.9rem' }}></i>
        </span>
        My Documents
      </h5>
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-4">
          <div className="mb-3">
            <label className="btn" style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 8 }}>
              {uploading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-upload me-2"></i>}
              Upload Document
              <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
            </label>
            <small className="ms-2" style={{ color: '#6b7c93' }}>Max 10MB (PDF, JPG, PNG, DOC)</small>
          </div>
          {documents.length === 0 ? (
            <p style={{ color: '#6b7c93' }}>No documents uploaded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead style={{ background: '#f4f8fb' }}>
                  <tr>
                    <th style={{ color: '#6b7c93', fontWeight: 600 }}>#</th>
                    <th style={{ color: '#6b7c93', fontWeight: 600 }}>File Name</th>
                    <th style={{ color: '#6b7c93', fontWeight: 600 }}>Type</th>
                    <th style={{ color: '#6b7c93', fontWeight: 600 }}>Upload Date</th>
                    <th style={{ color: '#6b7c93', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, i) => (
                    <tr key={doc.documentId}>
                      <td>{i + 1}</td>
                      <td><i className="bi bi-file-earmark me-1" style={{ color: '#1B6EB5' }}></i>{doc.fileName}</td>
                      <td><span className="badge" style={{ background: '#e8f0fe', color: '#1B6EB5' }}>{doc.fileType?.split('/')[1] || 'file'}</span></td>
                      <td style={{ color: '#6b7c93' }}>{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button className="btn btn-sm me-1" style={{ background: '#e8f0fe', color: '#1B6EB5', border: '1px solid #1B6EB5', borderRadius: 6 }} onClick={() => handleDownload(doc)}>
                          <i className="bi bi-download"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6 }} onClick={() => handleDeleteDoc(doc.documentId)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
