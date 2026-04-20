package com.doctorapp.service.impl;

import com.doctorapp.dto.AppointmentDTO;
import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.AvailabilityDates;
import com.doctorapp.entity.Doctor;
import com.doctorapp.entity.Patient;
import com.doctorapp.entity.TimeSlot;
import com.doctorapp.exception.ResourceNotFoundException;
import com.doctorapp.repository.IAppointmentRepository;
import com.doctorapp.repository.jpa.AvailabilityDatesJpaRepository;
import com.doctorapp.repository.jpa.DoctorJpaRepository;
import com.doctorapp.repository.jpa.PatientJpaRepository;
import com.doctorapp.repository.jpa.TimeSlotJpaRepository;
import com.doctorapp.service.IAppointmentService;
import com.doctorapp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AppointmentServiceImpl implements IAppointmentService {

    @Autowired
    private IAppointmentRepository appointmentRepository;

    @Autowired
    private PatientJpaRepository patientJpaRepository;

    @Autowired
    private DoctorJpaRepository doctorJpaRepository;

    @Autowired
    private AvailabilityDatesJpaRepository availabilityDatesJpaRepository;

    @Autowired
    private TimeSlotJpaRepository timeSlotJpaRepository;

    @Autowired
    private NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.getAllAppointments();
    }

    @Override
    @Transactional(readOnly = true)
    public Appointment getAppointment(int appointmentId) {
        return appointmentRepository.getAppointment(appointmentId);
    }

    @Override
    public Appointment addAppointment(Appointment app) {
        return appointmentRepository.addAppointment(app);
    }

    @Override
    public Appointment bookAppointment(AppointmentDTO dto) {
        Patient patient = patientJpaRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "patientId", dto.getPatientId()));
        Doctor doctor = doctorJpaRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "doctorId", dto.getDoctorId()));

        // Validate doctor availability
        List<AvailabilityDates> availability = availabilityDatesJpaRepository.findByDoctor(doctor);
        boolean isAvailable = availability.stream().anyMatch(a -> !dto.getAppointmentDate().isBefore(a.getFromDate()) &&
                !dto.getAppointmentDate().isAfter(a.getEndDate()));

        if (!isAvailable) {
            throw new IllegalArgumentException("Doctor is not available on " + dto.getAppointmentDate());
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(dto.getAppointmentDate());
        appointment.setAppointmentStatus("PENDING");
        appointment.setRemark(dto.getRemark());

        // Assign time slot (slot is only marked booked when doctor confirms)
        if (dto.getTimeSlotId() != null) {
            TimeSlot slot = timeSlotJpaRepository.findByIdWithLock(dto.getTimeSlotId())
                    .orElseThrow(() -> new ResourceNotFoundException("TimeSlot", "timeSlotId", dto.getTimeSlotId()));
            if (slot.isBooked()) {
                throw new IllegalArgumentException("This time slot is already booked. Please select another slot.");
            }
            appointment.setTimeSlot(slot);
        }

        Appointment saved = appointmentRepository.addAppointment(appointment);

        // Notify the doctor about new appointment request
        notificationService.createNotification(
                doctor.getUser().getUserId(),
                "New Appointment Request",
                "New appointment request from " + patient.getPatientName() + " on " + dto.getAppointmentDate(),
                "APPOINTMENT_BOOKED",
                (long) saved.getAppointmentId());

        return saved;
    }

    @Override
    public Appointment deleteAppointment(int appointmentId) {
        return appointmentRepository.deleteAppointment(appointmentId);
    }

    @Override
    public Appointment updateAppointment(Appointment app) {
        return appointmentRepository.updateAppointment(app);
    }

    @Override
    public Appointment approveAppointment(int appointmentId) {
        Appointment appointment = appointmentRepository.getAppointment(appointmentId);
        appointment.setAppointmentStatus("APPROVED");
        Appointment updated = appointmentRepository.updateAppointment(appointment);

        notificationService.createNotification(
                appointment.getPatient().getUser().getUserId(),
                "Appointment Approved",
                "Dr. " + appointment.getDoctor().getDoctorName() + " approved your appointment for "
                        + appointment.getAppointmentDate(),
                "APPOINTMENT_APPROVED",
                (long) appointmentId);

        return updated;
    }

    @Override
    public Appointment rejectAppointment(int appointmentId) {
        Appointment appointment = appointmentRepository.getAppointment(appointmentId);
        appointment.setAppointmentStatus("REJECTED");
        Appointment updated = appointmentRepository.updateAppointment(appointment);

        notificationService.createNotification(
                appointment.getPatient().getUser().getUserId(),
                "Appointment Declined",
                "Dr. " + appointment.getDoctor().getDoctorName() + " declined your appointment for "
                        + appointment.getAppointmentDate(),
                "APPOINTMENT_REJECTED",
                (long) appointmentId);

        return updated;
    }

    @Override
    public Appointment confirmAppointment(int appointmentId) {
        Appointment appointment = appointmentRepository.getAppointment(appointmentId);
        appointment.setAppointmentStatus("CONFIRMED");
        // Mark the time slot as booked only upon confirmation
        if (appointment.getTimeSlot() != null) {
            TimeSlot slot = appointment.getTimeSlot();
            slot.setBooked(true);
            timeSlotJpaRepository.save(slot);
        }
        Appointment updated = appointmentRepository.updateAppointment(appointment);

        notificationService.createNotification(
                appointment.getPatient().getUser().getUserId(),
                "Appointment Confirmed",
                "Your appointment with Dr. " + appointment.getDoctor().getDoctorName() + " on "
                        + appointment.getAppointmentDate() + " is confirmed!",
                "APPOINTMENT_CONFIRMED",
                (long) appointmentId);

        return updated;
    }

    @Override
    public Appointment cancelAppointment(int appointmentId) {
        Appointment appointment = appointmentRepository.getAppointment(appointmentId);
        if ("CONFIRMED".equals(appointment.getAppointmentStatus())) {
            throw new IllegalArgumentException("Cannot cancel a confirmed appointment. Please contact the doctor.");
        }
        // Release the time slot only if it was confirmed (slot is only booked on
        // confirmation)
        if (appointment.getTimeSlot() != null && "CONFIRMED".equals(appointment.getAppointmentStatus())) {
            TimeSlot slot = appointment.getTimeSlot();
            slot.setBooked(false);
            timeSlotJpaRepository.save(slot);
        }
        appointment.setAppointmentStatus("CANCELLED");
        Appointment updated = appointmentRepository.updateAppointment(appointment);

        // Notify the doctor when a patient cancels
        notificationService.createNotification(
                appointment.getDoctor().getUser().getUserId(),
                "Appointment Cancelled",
                appointment.getPatient().getPatientName() + " cancelled the appointment on "
                        + appointment.getAppointmentDate(),
                "APPOINTMENT_CANCELLED",
                (long) appointmentId);

        return updated;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointments(Doctor doc) {
        return appointmentRepository.getAppointments(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointments(Patient patient) {
        return appointmentRepository.getAppointments(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointments(LocalDate date) {
        return appointmentRepository.getAppointments(date);
    }
}
