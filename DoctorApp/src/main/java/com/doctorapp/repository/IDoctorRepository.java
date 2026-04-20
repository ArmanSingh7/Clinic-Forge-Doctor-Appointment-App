package com.doctorapp.repository;

import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;

import java.util.List;

public interface IDoctorRepository {

    Doctor addDoctor(Doctor bean);

    Doctor updateDoctorProfile(Doctor bean);

    AvailabilityDates addAvailability(AvailabilityDates bean);

    AvailabilityDates updateAvailability(AvailabilityDates bean);

    Doctor getDoctor(Doctor doc);

    Doctor removeDoctor(Doctor doc);

    List<Doctor> getDoctorList();

    List<Doctor> getDoctorList(String speciality);
}
