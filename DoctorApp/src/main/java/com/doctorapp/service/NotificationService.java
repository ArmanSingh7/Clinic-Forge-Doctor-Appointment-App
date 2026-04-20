package com.doctorapp.service;

import com.doctorapp.dto.NotificationDTO;

import java.util.List;

public interface NotificationService {

    void createNotification(int recipientUserId, String title, String message, String type, Long referenceId);

    List<NotificationDTO> getNotifications(int userId);

    long getUnreadCount(int userId);

    void markAsRead(Long notificationId);

    void markAllAsRead(int userId);

    void deleteNotification(Long notificationId);
}
