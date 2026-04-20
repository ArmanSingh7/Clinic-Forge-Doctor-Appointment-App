package com.doctorapp.service;

import com.doctorapp.dto.AppointmentDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;

import java.time.LocalDate;
import java.util.List;

public interface IAppointmentService {

    List<Appointment> getAllAppointments();

    Appointment getAppointment(int appointmentId);

    Appointment addAppointment(Appointment app);

    Appointment bookAppointment(AppointmentDTO dto);

    Appointment deleteAppointment(int appointmentId);

    Appointment updateAppointment(Appointment app);

    Appointment approveAppointment(int appointmentId);

    Appointment rejectAppointment(int appointmentId);

    Appointment confirmAppointment(int appointmentId);

    Appointment cancelAppointment(int appointmentId);

    List<Appointment> getAppointments(Doctor doc);

    List<Appointment> getAppointments(Patient patient);

    List<Appointment> getAppointments(LocalDate date);
}
