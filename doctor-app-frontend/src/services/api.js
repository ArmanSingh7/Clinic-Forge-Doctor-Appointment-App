import axios from 'axios';

// In production set VITE_API_URL (e.g. https://clinicforge-api.onrender.com).
// Locally it stays empty and Vite's dev proxy forwards /api to localhost:8080.
export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't redirect on login/auth failures — let the component show the error
      if (!url.includes('/users/login') && !url.includes('/users/register')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/users/login', data);
export const registerPatient = (data) => api.post('/users/register/patient', data);
export const registerDoctor = (data) => api.post('/users/register/doctor', data);
export const forgotPassword = (email) => api.post('/users/forgot-password', { email });
export const resetPassword = (data) => api.post('/users/reset-password', data);

// Doctors
export const getAllDoctors = () => api.get('/doctors');
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const getDoctorsBySpeciality = (speciality) => api.get(`/doctors/speciality/${speciality}`);
export const searchDoctors = (params) => api.get('/doctors/search', { params });
export const addDoctor = (data) => api.post('/doctors/add', data);
export const updateDoctor = (data) => api.put('/doctors/update', data);
export const removeDoctor = (data) => api.delete('/doctors/remove', { data });
export const addAvailability = (data) => api.post('/doctors/availability/add', data);
export const updateAvailability = (data) => api.put('/doctors/availability/update', data);
export const deleteAvailability = (availabilityId) => api.delete(`/doctors/availability/${availabilityId}`);
export const getAvailabilityByDoctor = (doctorId) => api.get(`/doctors/availability/${doctorId}`);
export const getAvailableSlots = (doctorId, date) => api.get(`/doctors/${doctorId}/slots`, { params: { date } });
export const getAllSlots = (doctorId, date) => api.get(`/doctors/${doctorId}/slots/all`, { params: { date } });
export const sendDoctorEmail = (data) => api.post('/doctors/send-email', data);
export const uploadDoctorPhoto = (doctorId, formData) => api.post(`/doctors/${doctorId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Patients
export const getAllPatients = () => api.get('/patients');
export const getPatientById = (id) => api.get(`/patients/${id}`);
export const getPatientsByDoctor = (doctorId) => api.get(`/patients/by-doctor/${doctorId}`);
export const getPatientsByDate = (date) => api.get(`/patients/by-date/${date}`);
export const registerPatientDirect = (data) => api.post('/patients/register', data);
export const updatePatient = (data) => api.put('/patients/update', data);
export const removePatient = (data) => api.delete('/patients/remove', { data });
export const getPatientHistory = (patientId, doctorId) => api.get(`/patients/${patientId}/history`, { params: { doctorId } });
export const uploadPatientPhoto = (patientId, formData) => api.post(`/patients/${patientId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Appointments
export const getAllAppointments = () => api.get('/appointments');
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const getAppointmentsByDoctor = (doctorId) => api.get(`/appointments/by-doctor/${doctorId}`);
export const bookAppointment = (data) => api.post('/appointments/book', data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
export const approveAppointment = (id) => api.put(`/appointments/${id}/approve`);
export const rejectAppointment = (id) => api.put(`/appointments/${id}/reject`);
export const confirmAppointment = (id) => api.put(`/appointments/${id}/confirm`);
export const cancelAppointment = (id) => api.put(`/appointments/${id}/cancel`);

// Feedback
export const addFeedback = (data) => api.post('/feedbacks/add', data);
export const getFeedbackById = (id) => api.get(`/feedbacks/${id}`);
export const getFeedbacksByDoctor = (doctorId) => api.get(`/feedbacks/by-doctor/${doctorId}`);
export const getFeedbackByAppointment = (appointmentId) => api.get(`/feedbacks/by-appointment/${appointmentId}`);

// Admin
export const addAdmin = (data) => api.post('/admins/add', data);
export const updateAdmin = (data) => api.put('/admins/update', data);
export const removeAdmin = (data) => api.delete('/admins/remove', { data });
export const getAdminById = (id) => api.get(`/admins/${id}`);

// Documents
export const uploadDocument = (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getDocumentsByPatient = (patientId) => api.get(`/documents/patient/${patientId}`);
export const getDocumentsByAppointment = (appointmentId) => api.get(`/documents/appointment/${appointmentId}`);
export const downloadDocument = (documentId) => api.get(`/documents/${documentId}/download`, { responseType: 'blob' });
export const deleteDocument = (documentId) => api.delete(`/documents/${documentId}`);
export const uploadDoctorDocument = (formData) => api.post('/documents/doctor/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getDocumentsByDoctor = (doctorId) => api.get(`/documents/doctor/${doctorId}`);

// Medicines
export const addMedicines = (appointmentId, medicines) => api.post(`/medicines/appointment/${appointmentId}`, medicines);
export const getMedicinesByAppointment = (appointmentId) => api.get(`/medicines/appointment/${appointmentId}`);
export const updateMedicine = (medicineId, data) => api.put(`/medicines/${medicineId}`, data);
export const deleteMedicine = (medicineId) => api.delete(`/medicines/${medicineId}`);

// Notifications
export const getNotifications = (userId) => api.get(`/notifications/${userId}`);
export const getUnreadCount = (userId) => api.get(`/notifications/${userId}/unread-count`);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = (userId) => api.put(`/notifications/${userId}/read-all`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

export default api;
