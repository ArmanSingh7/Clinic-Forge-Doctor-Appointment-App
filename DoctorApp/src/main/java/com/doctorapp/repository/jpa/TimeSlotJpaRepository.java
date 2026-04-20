package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.TimeSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotJpaRepository extends JpaRepository<TimeSlot, Integer> {

    List<TimeSlot> findByDoctorAndDate(Doctor doctor, LocalDate date);

    List<TimeSlot> findByDoctorAndDateAndIsBookedFalse(Doctor doctor, LocalDate date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TimeSlot t WHERE t.timeSlotId = :id")
    Optional<TimeSlot> findByIdWithLock(@Param("id") int id);

    void deleteByDoctorAndDateBetween(Doctor doctor, LocalDate startDate, LocalDate endDate);
}
