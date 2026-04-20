package com.doctorapp.service.impl;

import com.doctorapp.dto.NotificationDTO;
import com.doctorapp.entity.Notification;
import com.doctorapp.entity.User;
import com.doctorapp.repository.jpa.NotificationJpaRepository;
import com.doctorapp.repository.jpa.UserJpaRepository;
import com.doctorapp.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Autowired
    private NotificationJpaRepository notificationRepository;

    @Autowired
    private UserJpaRepository userJpaRepository;

    @Override
    public void createNotification(int recipientUserId, String title, String message, String type, Long referenceId) {
        try {
            User recipient = userJpaRepository.findById(recipientUserId).orElse(null);
            if (recipient == null) {
                log.warn("Cannot create notification: user {} not found", recipientUserId);
                return;
            }

            Notification notification = new Notification();
            notification.setRecipient(recipient);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setReferenceId(referenceId);

            notificationRepository.save(notification);
        } catch (Exception e) {
            // Don't let notification failures break the main operation
            log.error("Failed to create notification for user {}: {}", recipientUserId, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotifications(int userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(int userId) {
        return notificationRepository.countByRecipientUserIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    public void markAllAsRead(int userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setReferenceId(n.getReferenceId());
        return dto;
    }
}
