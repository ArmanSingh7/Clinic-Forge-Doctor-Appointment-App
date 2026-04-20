package com.doctorapp.controller;

import com.doctorapp.dto.ApiResponse;
import com.doctorapp.dto.NotificationDTO;
import com.doctorapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationDTO>>> getNotifications(@PathVariable int userId) {
        List<NotificationDTO> notifications = notificationService.getNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", notifications));
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable int userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/{userId}/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(@PathVariable int userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }
}
