package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationJpaRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(int userId);

    List<Notification> findByRecipientUserIdAndIsReadFalseOrderByCreatedAtDesc(int userId);

    long countByRecipientUserIdAndIsReadFalse(int userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient.userId = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") int userId);
}
