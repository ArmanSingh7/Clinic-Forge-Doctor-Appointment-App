package com.doctorapp.repository.impl;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.exception.DuplicateResourceException;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IPatientRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class PatientRepositoryImpl implements IPatientRepository {

    @Autowired
    private PatientJpaRepository patientJpaRepository;

    @Override
    public Patient addPatient(Patient bean) {
        if (patientJpaRepository.existsByEmail(bean.getEmail())) {
            throw new DuplicateResourceException("Patient", "email", bean.getEmail());
        }
        return patientJpaRepository.save(bean);
    }

    @Override
    public Patient updatePatientDetails(Patient bean) {
        patientJpaRepository.findById(bean.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientId", bean.getPatientId()));
        return patientJpaRepository.save(bean);
    }

    @Override
    public Patient removePatientDetails(Patient bean) {
        Patient existing = patientJpaRepository.findById(bean.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientId", bean.getPatientId()));
        patientJpaRepository.delete(existing);
        return existing;
    }

    @Override
    public Patient getPatient(Patient bean) {
        return patientJpaRepository.findById(bean.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientId", bean.getPatientId()));
    }

    @Override
    public List<Patient> getAllPatient() {
        return patientJpaRepository.findAll();
    }

    @Override
    public List<Patient> getPatientListByDoctor(Doctor doctor) {
        return patientJpaRepository.findPatientsByDoctor(doctor.getDoctorId());
    }

    @Override
    public List<Patient> getPatientListByDate(LocalDate appdate) {
        return patientJpaRepository.findPatientsByAppointmentDate(appdate);
    }
}
