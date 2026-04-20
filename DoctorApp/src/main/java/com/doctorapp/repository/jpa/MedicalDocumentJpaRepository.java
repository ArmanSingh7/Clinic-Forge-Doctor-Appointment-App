package com.doctorapp.repository.jpa;

import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.MedicalDocument;
import com.doctorapp.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalDocumentJpaRepository extends JpaRepository<MedicalDocument, Integer> {

    List<MedicalDocument> findByPatient(Patient patient);

    List<MedicalDocument> findByDoctor(Doctor doctor);

    List<MedicalDocument> findByAppointment(Appointment appointment);
}
