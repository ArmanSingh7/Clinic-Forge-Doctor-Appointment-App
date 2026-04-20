import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getNotifications, deleteNotification } from '../../services/api';
import toast from 'react-hot-toast';
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

export default function Notifications() {
  const { user } = useAuth();
  const { markRead, markAllRead, refreshNotifications } = useNotifications();
  const [allNotifications, setAllNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all | unread
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getNotifications(user.userId);
      setAllNotifications(res.data?.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) fetchAll();
  }, [user?.userId]);

  const filtered = filter === 'unread'
    ? allNotifications.filter(n => !n.read)
    : allNotifications;

  const handleMarkRead = async (notif) => {
    if (!notif.read) {
      await markRead(notif.id);
      setAllNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setAllNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setAllNotifications(prev => prev.filter(n => n.id !== id));
      refreshNotifications();
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatTime = (dateStr) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const unreadCount = allNotifications.filter(n => !n.read).length;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>Notifications</h4>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={filter === 'all' ? { background: '#1B6EB5', borderColor: '#1B6EB5' } : {}}
              onClick={() => setFilter('all')}
            >
              All ({allNotifications.length})
            </button>
            <button
              className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-outline-secondary'}`}
              style={filter === 'unread' ? { background: '#1B6EB5', borderColor: '#1B6EB5' } : {}}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-outline-primary" style={{ borderColor: '#1B6EB5', color: '#1B6EB5' }} onClick={handleMarkAllRead}>
              <i className="bi bi-check-all me-1"></i>Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-bell-slash" style={{ fontSize: '3rem', color: '#c4c4c4' }}></i>
          <p className="text-muted mt-2">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
          {filtered.map((notif, idx) => (
            <div
              key={notif.id}
              className="d-flex align-items-start gap-3 p-3"
              style={{
                borderBottom: idx < filtered.length - 1 ? '1px solid #f1f3f5' : 'none',
                background: notif.read ? '#fff' : '#f0f7ff',
                cursor: 'pointer',
              }}
              onClick={() => handleMarkRead(notif)}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                style={{
                  width: 40, height: 40,
                  background: (notificationColors[notif.type] || '#6b7c93') + '15',
                }}
              >
                <i
                  className={`bi ${notificationIcons[notif.type] || 'bi-bell'}`}
                  style={{ color: notificationColors[notif.type] || '#6b7c93', fontSize: '1rem' }}
                ></i>
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <span className="fw-semibold" style={{ fontSize: '0.9rem', color: '#1a1a2e' }}>{notif.title}</span>
                    {!notif.read && (
                      <span className="badge rounded-pill ms-2" style={{ background: '#1B6EB5', fontSize: '0.65rem' }}>New</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">{formatTime(notif.createdAt)}</small>
                    <button
                      className="btn btn-sm p-0"
                      style={{ color: '#dc3545', fontSize: '0.85rem' }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                      title="Delete notification"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
