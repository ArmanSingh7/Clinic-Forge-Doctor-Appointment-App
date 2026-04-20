package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientJpaRepository extends JpaRepository<Patient, Integer> {

    Optional<Patient> findByEmailAndPassword(String email, String password);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.doctor.doctorId = :doctorId")
    List<Patient> findPatientsByDoctor(@Param("doctorId") int doctorId);

    @Query("SELECT DISTINCT a.patient FROM Appointment a WHERE a.appointmentDate = :date")
    List<Patient> findPatientsByAppointmentDate(@Param("date") LocalDate date);

    Optional<Patient> findByUser(User user);

    Optional<Patient> findByMobileNo(String mobileNo);

    Optional<Patient> findByEmail(String email);
}
