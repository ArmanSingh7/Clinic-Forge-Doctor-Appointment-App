import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Public Pages
import PublicDoctors from './pages/public/PublicDoctors';
import Services from './pages/public/Services';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
import FAQ from './pages/public/FAQ';

// Patient
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import PatientProfile from './pages/patient/PatientProfile';

// Shared
import Notifications from './pages/shared/Notifications';

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorFeedbacks from './pages/doctor/DoctorFeedbacks';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import ManageAppointments from './pages/admin/ManageAppointments';
import AdminFeedbacks from './pages/admin/AdminFeedbacks';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/doctors" element={<PublicDoctors />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/faq" element={<FAQ />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute roles={['PATIENT']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<PatientDashboard />} />
            <Route path="doctors" element={<FindDoctors />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute roles={['DOCTOR']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="availability" element={<DoctorAvailability />} />
            <Route path="feedbacks" element={<DoctorFeedbacks />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="appointments" element={<ManageAppointments />} />
            <Route path="feedbacks" element={<AdminFeedbacks />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
