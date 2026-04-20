package com.doctorapp.service;

import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;

import java.time.LocalDate;
import java.util.List;

public interface IPatientService {

    Patient addPatient(Patient bean);

    Patient updatePatientDetails(Patient bean);

    Patient removePatientDetails(Patient bean);

    Patient getPatient(Patient bean);

    List<Patient> getAllPatient();

    List<Patient> getPatientListByDoctor(Doctor doctor);

    List<Patient> getPatientListByDate(LocalDate appdate);
}
