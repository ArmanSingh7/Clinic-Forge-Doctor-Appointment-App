package com.doctorapp.repository.impl;

import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IAppointmentRepository;
import com.doctorapp.repository.jpa.AppointmentJpaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class AppointmentRepositoryImpl implements IAppointmentRepository {

    @Autowired
    private AppointmentJpaRepository appointmentJpaRepository;

    @Override
    public List<Appointment> getAllAppointments() {
        return appointmentJpaRepository.findAll();
    }

    @Override
    public Appointment getAppointment(int appointmentId) {
        return appointmentJpaRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "appointmentId", appointmentId));
    }

    @Override
    public Appointment addAppointment(Appointment app) {
        return appointmentJpaRepository.save(app);
    }

    @Override
    public Appointment deleteAppointment(int appointmentId) {
        Appointment existing = appointmentJpaRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "appointmentId", appointmentId));
        appointmentJpaRepository.delete(existing);
        return existing;
    }

    @Override
    public Appointment updateAppointment(Appointment app) {
        appointmentJpaRepository.findById(app.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "appointmentId", app.getAppointmentId()));
        return appointmentJpaRepository.save(app);
    }

    @Override
    public List<Appointment> getAppointments(Doctor doc) {
        return appointmentJpaRepository.findByDoctor(doc);
    }

    @Override
    public List<Appointment> getAppointments(Patient patient) {
        return appointmentJpaRepository.findByPatient(patient);
    }

    @Override
    public List<Appointment> getAppointments(LocalDate date) {
        return appointmentJpaRepository.findByAppointmentDate(date);
    }
}
