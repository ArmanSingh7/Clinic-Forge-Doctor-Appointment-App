import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getDoctorById, getPatientById } from "../services/api";
import ClinicForgeLogo from "./ClinicForgeLogo";

const sidebarLinks = {
  ADMIN: [
    { to: "/admin", icon: "bi-grid-fill", label: "Dashboard" },
    { to: "/admin/doctors", icon: "bi-heart-pulse", label: "Doctors" },
    { to: "/admin/patients", icon: "bi-people-fill", label: "Patients" },
    {
      to: "/admin/appointments",
      icon: "bi-calendar-check",
      label: "Appointments",
    },
    { to: "/admin/feedbacks", icon: "bi-chat-dots-fill", label: "Feedbacks" },
  ],
  DOCTOR: [
    { to: "/doctor", icon: "bi-grid-fill", label: "Dashboard" },
    {
      to: "/doctor/appointments",
      icon: "bi-calendar-check",
      label: "Appointments",
    },
    { to: "/doctor/patients", icon: "bi-people-fill", label: "My Patients" },
    {
      to: "/doctor/availability",
      icon: "bi-clock-fill",
      label: "Availability",
    },
    { to: "/doctor/feedbacks", icon: "bi-chat-dots-fill", label: "Feedbacks" },
    { to: "/doctor/profile", icon: "bi-person-circle", label: "Profile" },
  ],
  PATIENT: [
    { to: "/patient", icon: "bi-grid-fill", label: "Dashboard" },
    { to: "/patient/doctors", icon: "bi-heart-pulse", label: "Find Doctors" },
    {
      to: "/patient/appointments",
      icon: "bi-calendar-check",
      label: "My Appointments",
    },
    {
      to: "/patient/book",
      icon: "bi-plus-circle-fill",
      label: "Book Appointment",
    },
    { to: "/patient/profile", icon: "bi-person-circle", label: "Profile" },
  ],
};

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = sidebarLinks[user?.role] || [];
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (user?.role === "DOCTOR" && user?.profileId) {
      getDoctorById(user.profileId)
        .then((res) => setProfileData(res.data.data))
        .catch(() => {});
    } else if (user?.role === "PATIENT" && user?.profileId) {
      getPatientById(user.profileId)
        .then((res) => setProfileData(res.data.data))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="d-flex flex-column vh-100 position-fixed top-0 start-0"
      style={{
        width: collapsed ? 70 : 260,
        zIndex: 1040,
        transition: "width 0.3s ease",
        background: "#ffffff",
        borderRight: "1px solid #e8eef3",
      }}
    >
      {/* Toggle Button */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-3"
        style={{ borderBottom: "1px solid #e8eef3" }}
      >
        {!collapsed && (
          <Link
            to="/"
            className="fw-bold fs-5 text-decoration-none d-flex align-items-center"
            style={{ color: "#1B6EB5" }}
          >
            <ClinicForgeLogo size={28} /><span className="ms-2">Clinic Forge</span>
          </Link>
        )}
        <button
          className="btn btn-sm"
          style={{ color: "#1B6EB5", border: "1px solid #e8eef3" }}
          onClick={onToggle}
        >
          <i className={`bi ${collapsed ? "bi-list" : "bi-x-lg"}`}></i>
        </button>
      </div>

      {/* Profile Section */}
      {!collapsed && profileData && (
        <div
          className="text-center py-3 px-3"
          style={{ borderBottom: "1px solid #e8eef3" }}
        >
          {profileData.profilePhoto ? (
            <img
              src={profileData.profilePhoto}
              alt="Profile"
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #1B6EB5",
              }}
              className="mb-2"
            />
          ) : (
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
              style={{
                width: 70,
                height: 70,
                border: "3px solid #1B6EB5",
                background: "#e8f0fe",
              }}
            >
              <i
                className={`bi ${user?.role === "DOCTOR" ? "bi-heart-pulse" : "bi-person-fill"} fs-2`}
                style={{ color: "#1B6EB5" }}
              ></i>
            </div>
          )}
          <div className="fw-bold small" style={{ color: "#1a1a2e" }}>
            {user?.role === "DOCTOR"
              ? `Dr. ${profileData.doctorName || ""}`
              : profileData.patientName || user?.profileName}
          </div>
          {user?.role === "DOCTOR" && profileData.speciality && (
            <small
              className="text-muted d-block"
              style={{ fontSize: "0.7rem" }}
            >
              {profileData.speciality}
            </small>
          )}
          {user?.role === "DOCTOR" && profileData.hospitalName && (
            <small
              className="text-muted d-block"
              style={{ fontSize: "0.7rem" }}
            >
              {profileData.hospitalName}
            </small>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-grow-1 py-3 overflow-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${user?.role?.toLowerCase()}`}
            className={({ isActive }) =>
              `d-flex align-items-center px-3 py-2 mx-2 my-1 rounded text-decoration-none sidebar-nav-link ${
                isActive ? "sidebar-active" : ""
              }`
            }
          >
            <i className={`bi ${link.icon} fs-5`}></i>
            {!collapsed && <span className="ms-3 small">{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3" style={{ borderTop: "1px solid #e8eef3" }}>
        <button
          className="btn btn-sm w-100 d-flex align-items-center justify-content-center py-2"
          style={{
            color: "#dc3545",
            background: "#fff5f5",
            border: "1px solid #fecaca",
            borderRadius: 8,
          }}
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
