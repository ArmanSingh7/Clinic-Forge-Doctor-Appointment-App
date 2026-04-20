package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackJpaRepository extends JpaRepository<Feedback, Integer> {

    List<Feedback> findByDoctor(Doctor doctor);

    Optional<Feedback> findByAppointment_AppointmentId(int appointmentId);
}
