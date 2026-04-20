package com.doctorapp.service;

import com.doctorapp.entity.Appointment;
import com.doctorapp.entity.TimeSlot;
import com.doctorapp.repository.jpa.AppointmentJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentReminderService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentReminderService.class);

    @Autowired
    private AppointmentJpaRepository appointmentJpaRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Runs every hour at minute 0.
     * Sends 24-hour reminders for confirmed appointments scheduled for tomorrow.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void send24HourReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Appointment> appointments = appointmentJpaRepository
                .findByAppointmentDateAndAppointmentStatusAndReminder24hSentFalse(tomorrow, "CONFIRMED");

        for (Appointment apt : appointments) {
            try {
                String patientEmail = apt.getPatient().getEmail();
                String doctorName = apt.getDoctor().getDoctorName();
                String patientName = apt.getPatient().getPatientName();
                String timeInfo = formatTimeSlot(apt.getTimeSlot());

                if (patientEmail != null && !patientEmail.isBlank()) {
                    String subject = "Appointment Reminder - Tomorrow with Dr. " + doctorName;
                    String body = "Dear " + patientName + ",\n\n"
                            + "This is a reminder that you have an appointment scheduled for tomorrow.\n\n"
                            + "Details:\n"
                            + "  Doctor: Dr. " + doctorName + "\n"
                            + "  Date: " + apt.getAppointmentDate() + "\n"
                            + "  Time: " + timeInfo + "\n"
                            + "  Hospital: " + (apt.getDoctor().getHospitalName() != null ? apt.getDoctor().getHospitalName() : "N/A") + "\n\n"
                            + "Please arrive 10 minutes early.\n\n"
                            + "If you need to cancel, please do so through the Clinic Forge app.\n\n"
                            + "Regards,\nClinic Forge Team";

                    emailService.sendEmail(patientEmail, subject, body);
                    apt.setReminder24hSent(true);
                    appointmentJpaRepository.save(apt);
                    logger.info("24h reminder sent for appointment {} to {}", apt.getAppointmentId(), patientEmail);
                }
            } catch (Exception e) {
                logger.error("Failed to send 24h reminder for appointment {}: {}", apt.getAppointmentId(), e.getMessage());
            }
        }

        if (!appointments.isEmpty()) {
            logger.info("Processed {} 24-hour reminders for {}", appointments.size(), tomorrow);
        }
    }

    /**
     * Runs every 30 minutes.
     * Sends 1-hour reminders for confirmed appointments starting within the next 60-90 minutes.
     */
    @Scheduled(cron = "0 0,30 * * * *")
    @Transactional
    public void send1HourReminders() {
        LocalDate today = LocalDate.now();
        List<Appointment> appointments = appointmentJpaRepository
                .findByAppointmentDateAndAppointmentStatusAndReminder1hSentFalse(today, "CONFIRMED");

        LocalTime now = LocalTime.now();

        for (Appointment apt : appointments) {
            try {
                TimeSlot slot = apt.getTimeSlot();
                if (slot == null) continue;

                LocalTime slotStart = slot.getStartTime();
                // Send reminder if appointment is between 30 and 90 minutes from now
                if (slotStart.isAfter(now.plusMinutes(30)) && slotStart.isBefore(now.plusMinutes(90))) {
                    String patientEmail = apt.getPatient().getEmail();
                    String doctorName = apt.getDoctor().getDoctorName();
                    String patientName = apt.getPatient().getPatientName();

                    if (patientEmail != null && !patientEmail.isBlank()) {
                        String subject = "Appointment in ~1 Hour - Dr. " + doctorName;
                        String body = "Dear " + patientName + ",\n\n"
                                + "Your appointment with Dr. " + doctorName + " is coming up soon!\n\n"
                                + "Time: " + formatTimeSlot(slot) + "\n"
                                + "Hospital: " + (apt.getDoctor().getHospitalName() != null ? apt.getDoctor().getHospitalName() : "N/A") + "\n\n"
                                + "Please make sure you're on your way.\n\n"
                                + "Regards,\nClinic Forge Team";

                        emailService.sendEmail(patientEmail, subject, body);
                        apt.setReminder1hSent(true);
                        appointmentJpaRepository.save(apt);
                        logger.info("1h reminder sent for appointment {} to {}", apt.getAppointmentId(), patientEmail);
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to send 1h reminder for appointment {}: {}", apt.getAppointmentId(), e.getMessage());
            }
        }
    }

    private String formatTimeSlot(TimeSlot slot) {
        if (slot == null) return "Time not specified";
        return slot.getStartTime() + " - " + slot.getEndTime();
    }

    /**
     * Runs every hour.
     * Auto-rejects PENDING or APPROVED appointments whose date/time has passed
     * without being confirmed by the doctor or admin.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void autoRejectExpiredAppointments() {
        List<String> statuses = List.of("PENDING", "APPROVED");
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        // 1. Past-date appointments (date < today)
        List<Appointment> expired = new ArrayList<>(
                appointmentJpaRepository.findExpiredAppointments(statuses, today));

        // 2. Same-day appointments whose time slot has already ended
        expired.addAll(
                appointmentJpaRepository.findExpiredAppointmentsToday(statuses, today, now));

        for (Appointment apt : expired) {
            try {
                apt.setAppointmentStatus("REJECTED");
                apt.setRemark("Auto-rejected: appointment time passed without confirmation");
                appointmentJpaRepository.save(apt);

                // Notify patient
                notificationService.createNotification(
                        apt.getPatient().getUser().getUserId(),
                        "Appointment Expired",
                        "Your appointment with Dr. " + apt.getDoctor().getDoctorName()
                                + " on " + apt.getAppointmentDate()
                                + " was automatically declined as it was not confirmed in time.",
                        "APPOINTMENT_REJECTED",
                        (long) apt.getAppointmentId());

                logger.info("Auto-rejected expired appointment {} (date={}, status={})",
                        apt.getAppointmentId(), apt.getAppointmentDate(), "REJECTED");
            } catch (Exception e) {
                logger.error("Failed to auto-reject appointment {}: {}",
                        apt.getAppointmentId(), e.getMessage());
            }
        }

        if (!expired.isEmpty()) {
            logger.info("Auto-rejected {} expired appointments", expired.size());
        }
    }
}
