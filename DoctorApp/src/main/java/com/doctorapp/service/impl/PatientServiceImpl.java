package com.doctorapp.service.impl;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.repository.IPatientRepository;
import com.doctorapp.service.IPatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class PatientServiceImpl implements IPatientService {

    @Autowired
    private IPatientRepository patientRepository;

    @Override
    public Patient addPatient(Patient bean) {
        return patientRepository.addPatient(bean);
    }

    @Override
    public Patient updatePatientDetails(Patient bean) {
        return patientRepository.updatePatientDetails(bean);
    }

    @Override
    public Patient removePatientDetails(Patient bean) {
        return patientRepository.removePatientDetails(bean);
    }

    @Override
    @Transactional(readOnly = true)
    public Patient getPatient(Patient bean) {
        return patientRepository.getPatient(bean);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getAllPatient() {
        return patientRepository.getAllPatient();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getPatientListByDoctor(Doctor doctor) {
        return patientRepository.getPatientListByDoctor(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getPatientListByDate(LocalDate appdate) {
        return patientRepository.getPatientListByDate(appdate);
    }
}
