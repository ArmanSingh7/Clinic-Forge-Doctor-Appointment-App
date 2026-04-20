import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await getUnreadCount(user.userId);
      setUnreadCount(res.data.data || 0);
    } catch {
      // silently fail
    }
  }, [user?.userId]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const res = await getNotifications(user.userId);
      setNotifications(res.data.data || []);
    } catch {
      // silently fail
    }
  }, [user?.userId]);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  const markRead = useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user?.userId) return;
    try {
      await markAllNotificationsRead(user.userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, [user?.userId]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (user?.userId) {
      fetchUnreadCount();
      intervalRef.current = setInterval(fetchUnreadCount, 30000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user?.userId, fetchUnreadCount]);

  // Reset on logout
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refreshNotifications, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
