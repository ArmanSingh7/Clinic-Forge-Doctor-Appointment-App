package com.doctorapp.repository;

import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;

import java.time.LocalDate;
import java.util.List;

public interface IAppointmentRepository {

    List<Appointment> getAllAppointments();

    Appointment getAppointment(int appointmentId);

    Appointment addAppointment(Appointment app);

    Appointment deleteAppointment(int appointmentId);

    Appointment updateAppointment(Appointment app);

    List<Appointment> getAppointments(Doctor doc);

    List<Appointment> getAppointments(Patient patient);

    List<Appointment> getAppointments(LocalDate date);
}
