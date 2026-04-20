import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  APPOINTMENT_BOOKED: 'bi-calendar-plus',
  APPOINTMENT_APPROVED: 'bi-check-circle',
  APPOINTMENT_REJECTED: 'bi-x-circle',
  APPOINTMENT_CONFIRMED: 'bi-calendar-check',
  APPOINTMENT_CANCELLED: 'bi-calendar-x',
  FEEDBACK_RECEIVED: 'bi-star',
};

const notificationColors = {
  APPOINTMENT_BOOKED: '#1B6EB5',
  APPOINTMENT_APPROVED: '#198754',
  APPOINTMENT_REJECTED: '#dc3545',
  APPOINTMENT_CONFIRMED: '#198754',
  APPOINTMENT_CANCELLED: '#dc3545',
  FEEDBACK_RECEIVED: '#f9a825',
};

export default function TopNavbar({ collapsed }) {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, refreshNotifications, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBellClick = async () => {
    if (!showNotifDropdown) {
      await refreshNotifications();
    }
    setShowNotifDropdown(!showNotifDropdown);
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markRead(notif.id);
    setShowNotifDropdown(false);
    // Navigate based on role
    const role = user?.role?.toLowerCase();
    if (notif.type?.includes('APPOINTMENT')) {
      navigate(`/${role}/appointments`);
    } else if (notif.type === 'FEEDBACK_RECEIVED') {
      navigate(`/${role}/feedbacks`);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllRead();
  };

  const handleViewAll = () => {
    setShowNotifDropdown(false);
    navigate(`/${user?.role?.toLowerCase()}/notifications`);
  };

  const recentNotifs = (notifications || []).slice(0, 5);

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <nav
      className="navbar navbar-expand navbar-light bg-white px-4 position-fixed top-0 end-0"
      style={{
        left: collapsed ? 70 : 260,
        zIndex: 1030,
        height: 60,
        transition: 'left 0.3s ease',
        borderBottom: '1px solid #e8eef3',
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <span className="text-muted fw-medium">
          Welcome back, <span className="fw-semibold" style={{ color: '#1a1a2e' }}>{user?.profileName || user?.userName}</span>
        </span>

        <div className="d-flex align-items-center gap-3">
          {/* Notification Bell */}
          <div className="position-relative">
            <button
              className="btn btn-sm position-relative"
              style={{ color: '#6b7c93' }}
              onClick={handleBellClick}
            >
              <i className="bi bi-bell fs-5"></i>
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                  style={{ background: '#dc3545', fontSize: '0.65rem', padding: '3px 6px' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifDropdown && (
              <div
                className="position-absolute shadow bg-white border-0"
                style={{
                  right: 0, top: 45, width: 360, borderRadius: 12,
                  border: '1px solid #e8eef3', zIndex: 1050,
                  maxHeight: 420, overflowY: 'auto',
                }}
              >
                <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ borderBottom: '1px solid #e8eef3' }}>
                  <h6 className="mb-0 fw-bold" style={{ color: '#1a1a2e', fontSize: '0.9rem' }}>Notifications</h6>
                  {unreadCount > 0 && (
                    <button className="btn btn-link btn-sm p-0 text-decoration-none" style={{ fontSize: '0.75rem', color: '#1B6EB5' }} onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>

                {recentNotifs.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-bell-slash fs-4 d-block mb-1"></i>
                    <small>No notifications yet</small>
                  </div>
                ) : (
                  recentNotifs.map((notif) => (
                    <div
                      key={notif.id}
                      className="d-flex align-items-start gap-2 px-3 py-2"
                      style={{
                        borderBottom: '1px solid #f1f3f5', cursor: 'pointer',
                        background: notif.read ? '#fff' : '#f0f7ff',
                      }}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                        style={{
                          width: 32, height: 32,
                          background: (notificationColors[notif.type] || '#6b7c93') + '15',
                        }}
                      >
                        <i
                          className={`bi ${notificationIcons[notif.type] || 'bi-bell'}`}
                          style={{ color: notificationColors[notif.type] || '#6b7c93', fontSize: '0.85rem' }}
                        ></i>
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <span className="fw-semibold" style={{ fontSize: '0.8rem', color: '#1a1a2e' }}>{notif.title}</span>
                          {!notif.read && (
                            <span className="rounded-circle flex-shrink-0 ms-1" style={{ width: 8, height: 8, background: '#1B6EB5', display: 'inline-block', marginTop: 5 }}></span>
                          )}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>{notif.message}</div>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>{formatTime(notif.createdAt)}</small>
                      </div>
                    </div>
                  ))
                )}

                <div className="text-center py-2" style={{ borderTop: '1px solid #e8eef3' }}>
                  <button className="btn btn-link btn-sm text-decoration-none" style={{ color: '#1B6EB5', fontSize: '0.8rem' }} onClick={handleViewAll}>
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <Dropdown align="end">
            <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0 shadow-none bg-transparent">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{ width: 36, height: 36, background: '#e8f0fe', border: '2px solid #1B6EB5' }}
              >
                <span className="fw-bold" style={{ color: '#1B6EB5' }}>
                  {(user?.profileName || user?.userName || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="d-none d-md-inline small" style={{ color: '#1a1a2e' }}>{user?.profileName || user?.userName}</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-0">
              <Dropdown.Header>
                <small className="text-muted">{user?.role}</small>
              </Dropdown.Header>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}
