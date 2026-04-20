package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentJpaRepository extends JpaRepository<Appointment, Integer> {

    List<Appointment> findByDoctor(Doctor doctor);

    List<Appointment> findByPatient(Patient patient);

    List<Appointment> findByAppointmentDate(LocalDate appointmentDate);

    List<Appointment> findByPatientAndDoctorOrderByAppointmentDateDesc(Patient patient, Doctor doctor);

    List<Appointment> findByAppointmentDateAndAppointmentStatusAndReminder24hSentFalse(LocalDate date, String status);

    List<Appointment> findByAppointmentDateAndAppointmentStatusAndReminder1hSentFalse(LocalDate date, String status);

    // Find expired appointments: past dates with PENDING or APPROVED status
    @Query("SELECT a FROM Appointment a WHERE a.appointmentStatus IN :statuses AND a.appointmentDate < :date")
    List<Appointment> findExpiredAppointments(@Param("statuses") List<String> statuses, @Param("date") LocalDate date);

    // Find expired same-day appointments: today's date but time slot has already ended
    @Query("SELECT a FROM Appointment a WHERE a.appointmentStatus IN :statuses AND a.appointmentDate = :date AND a.timeSlot.endTime < :time")
    List<Appointment> findExpiredAppointmentsToday(@Param("statuses") List<String> statuses, @Param("date") LocalDate date, @Param("time") LocalTime time);
}
