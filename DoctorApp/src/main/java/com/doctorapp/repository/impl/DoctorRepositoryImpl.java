package com.doctorapp.repository.impl;

import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;
import com.doctorapp.exception.DuplicateResourceException;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IDoctorRepository;
import com.doctorapp.repository.jpa.AvailabilityDatesJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class DoctorRepositoryImpl implements IDoctorRepository {

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Autowired
    private AvailabilityDatesJpaRepository availabilityDatesJpaRepository;

    @Override
    public Doctor addDoctor(Doctor bean) {
        if (doctorJpaRepository.existsByEmail(bean.getEmail())) {
            throw new DuplicateResourceException("Doctor", "email", bean.getEmail());
        }
        return doctorJpaRepository.save(bean);
    }

    @Override
    public Doctor updateDoctorProfile(Doctor bean) {
        doctorJpaRepository.findById(bean.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", bean.getDoctorId()));
        return doctorJpaRepository.save(bean);
    }

    @Override
    public AvailabilityDates addAvailability(AvailabilityDates bean) {
        doctorJpaRepository.findById(bean.getDoctor().getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", bean.getDoctor().getDoctorId()));
        return availabilityDatesJpaRepository.save(bean);
    }

    @Override
    public AvailabilityDates updateAvailability(AvailabilityDates bean) {
        availabilityDatesJpaRepository.findById(bean.getAvailabilityId())
                .orElseThrow(() -> new ResourceNotFoundException("AvailabilityDates", "availabilityId",
                        bean.getAvailabilityId()));
        return availabilityDatesJpaRepository.save(bean);
    }

    @Override
    public Doctor getDoctor(Doctor doc) {
        return doctorJpaRepository.findById(doc.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", doc.getDoctorId()));
    }

    @Override
    public Doctor removeDoctor(Doctor doc) {
        Doctor existing = doctorJpaRepository.findById(doc.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", doc.getDoctorId()));
        doctorJpaRepository.delete(existing);
        return existing;
    }

    @Override
    public List<Doctor> getDoctorList() {
        return doctorJpaRepository.findAll();
    }

    @Override
    public List<Doctor> getDoctorList(String speciality) {
        return doctorJpaRepository.findBySpeciality(speciality);
    }
}
